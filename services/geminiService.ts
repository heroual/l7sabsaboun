import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import GeminiAction to use enum values for type safety.
import { FinanceState, GeminiResponse, GeminiResponseSchema, GeminiAction, PublicGeminiResponse, PublicGeminiResponseSchema, ChatMessage, SmartSplitResponse, SmartSplitResponseSchema } from '../types';

const SYSTEM_INSTRUCTION = `
# الدور والشخصية

سميتك "لحساب صابون".
أنت واحد الوكيل مالي ذكي، قوي، ومحترف، كتهضر بالدارجة المغربية اللي ساهلة ومفهومة.
الدور ديالك هو تعاون المستخدم يدير حساب لفلوسو، يتبع المداخيل والمصاريف ديالو، يحط أهداف مالية، ويوصل ليها بتنظيم وتخطيط واعر.
عند المستخدم ممكن يكونو عندو بزاف ديال مصادر الدخل، مسجلين ف tableau سميتو 'incomeSources'. ملي يقولك زاد شي مدخول، استعمل action 'ADD_INCOME_SOURCE'.
ديما خصك تكون محفز، بسيط في هضرتك، ومكتحكمش فالمستخدم.

# المهمة الأساسية

مهمتك الرئيسية هي تساعد المستخدم يدير أمورو المالية عن طريق تتبع المداخيل والمصاريف، تحديد الأهداف، وتقديم تقارير ونصائح.
خاصك ديما تجاوب على شكل JSON اللي كيتبع Schema المحددة.
حقل 'responseMessage' هو الجواب ديالك للمستخدم بالدارجة المغربية.
حقول 'action' و 'payload' كيستعملهم التطبيق باش يبدل الحالة المالية.
بناءً على طلب المستخدم والحالة المالية الحالية، حدد الإجراء الصحيح وعمّر الـ payload بالمعلومات المناسبة.
ملي تزيد شي مصروف، صنفو فواحد من هاد الفئات بناء على النوع ديالو:
- 'كراء': فلوس الكراء.
- 'فواتير': الماء، الضو، الانترنت، التيليفون.
- 'الطموبيل': مازوت، اسيرونس، إصلاحات.
- 'التقدية': سوبرمارشي، خضرة، لحم، مواد تنظيف.
- 'الحوايج': شريتي حوايج، صبابط.
- 'خرجات': قهوة، ريسطوران، سينما، ترفيه.
- 'الكريديات': طريطات، سلف، كريدي بنك.
- 'العائلة': مصاريف الولاد، الوالدين، مناسبات عائلية.
- 'الصدقة': فلوس عاونتي بيهم شي حد.
- 'اخرى': أي حاجة مكتبعش لهادشي الفوق.

التاريخ ديال اليوم هو ${new Date().toLocaleDateString('en-CA')}. استعملو للمصاريف والمداخيل الجديدة.
خلي أجوبتك قصيرة ومفيدة.
`;

const PUBLIC_SYSTEM_INSTRUCTION = `
# الدور والشخصية
سميتك "لحساب صابون". أنت وكيل مالي ذكي، كتهضر بالدارجة المغربية. الدور ديالك هو تجاوب على الأسئلة العامة ديال الزوار حول تدبير الفلوس، التوفير، والميزانية.
أنت نسخة عامة ديال التطبيق، معندكش وصول لأي بيانات شخصية ديال المستخدم.
خصك تكون ودود، محفز، وتقدم نصائح عامة ومفيدة.
ديما شجع المستخدم باش يتسجل فالتطبيق باش يستافد من تتبع شخصي وميزات كاملة. مثلا، قول شي حاجة بحال "باش نعاونك كتر، تسجل فالتطبيق ونتبعو مصاريفك ونديرو أهداف خاصة بك!".

# المهمة الأساسية
جاوب على سؤال المستخدم بنصيحة مالية عامة بالدارجة.
خرج الجواب على شكل JSON اللي كيتبع Schema المحددة.
قدم 2 أو 3 اقتراحات لأسئلة متابعة ممكن يسولها المستخدم.
`;

const SALARY_SPLITTER_INSTRUCTION = `
# Role
You are a highly intelligent Moroccan Financial Advisor AI ("Sou9 EL AI Advisor").
Your goal is to analyze a user's salary, city of residence, fixed expenses, and goals, and then output a "Smart Salary Split".

# Logic & Knowledge Base (Morocco Context)
1. **Cost of Living**: You know that Casablanca/Rabat are expensive (rent, lifestyle). Agadir/Tangier are moderate. Smaller cities are cheaper. Adapt your judgment of "High/Low" expenses based on the City provided.
2. **50/30/20 Rule**: Try to guide the user towards 50% Needs, 30% Wants, 20% Savings/Debts, but be realistic based on their actual fixed inputs.
3. **Calculations**:
   - Deduct all user-provided fixed expenses from the Salary.
   - If the remaining is negative, WARN them strictly.
   - If positive, allocate the remainder intelligently:
     - Allocate to "Savings" based on their Goals.
     - Allocate to "Lifestyle/Pocket Money" (Plaisir).
     - Allocate to "Emergency Fund" if not present.

# Output Requirements
- Return strictly JSON matching the Schema.
- **Advice**: Write in friendly, professional Moroccan Darija.
- **Warnings**: If Rent is > 40% of salary, warn them. If Debt is too high, warn them.
- **Notes**: For each allocation, add a short note if it seems high/low/good.
`;


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to strictly ensure a value is a string to prevent React Error #310
// This is exported so other services can use it if needed
export const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

export const getFinancialUpdate = async (
  userInput: string,
  currentState: FinanceState
): Promise<GeminiResponse> => {
  try {
    const prompt = `
الحالة المالية الحالية:
${JSON.stringify(currentState)}

طلب المستخدم: "${userInput}"

حلل طلب المستخدم والحالة الحالية، من بعد، خرج الجواب على شكل JSON بناءً على الـ schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: GeminiResponseSchema,
      },
    });

    let jsonText = response.text.trim();
    // Clean up markdown if present
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/```$/, "");

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (e) {
        // Fallback mechanism for malformed JSON
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
             parsedResponse = JSON.parse(jsonText.substring(firstBrace, lastBrace + 1));
        } else {
            throw e;
        }
    }
    
    // Sanitize fields to ensure type safety
    if (parsedResponse) {
      parsedResponse.responseMessage = ensureString(parsedResponse.responseMessage);
    }

    return parsedResponse as GeminiResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      // FIX: Use the GeminiAction enum member instead of a string literal to fix the type error.
      action: GeminiAction.GENERAL_RESPONSE,
      payload: null,
      responseMessage: "سمح ليا، وقع شي خطأ. عاود حاول مرة أخرى."
    }
  }
};


export const getPublicFinancialAdvice = async (
  userInput: string,
  chatHistory: ChatMessage[]
): Promise<PublicGeminiResponse> => {
  try {
    const prompt = `
تاريخ المحادثة:
${JSON.stringify(chatHistory)}

سؤال المستخدم الجديد: "${userInput}"

جاوب على سؤال المستخدم وقدم ليه اقتراحات على شكل JSON بناءً على الـ schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: PUBLIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PublicGeminiResponseSchema,
      },
    });
    
    let jsonText = response.text.trim();
    // Clean up markdown if present
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/```$/, "");

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(jsonText);
    } catch (e) {
         const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
             parsedResponse = JSON.parse(jsonText.substring(firstBrace, lastBrace + 1));
        } else {
            throw e;
        }
    }

    // Sanitize fields to ensure type safety and prevent React Error #310
    if (parsedResponse) {
        parsedResponse.responseMessage = ensureString(parsedResponse.responseMessage);
        
        if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
          parsedResponse.suggestions = parsedResponse.suggestions.map(ensureString);
        } else {
            parsedResponse.suggestions = [];
        }
    } else {
       return {
         responseMessage: "سمح ليا، ماقدرتش نفهم. عاود بطريقة أخرى.",
         suggestions: []
       };
    }

    return parsedResponse as PublicGeminiResponse;

  } catch (error) {
    console.error("Error calling public Gemini API:", error);
    return {
      responseMessage: "سمح ليا، وقع شي خطأ تقني. عاود حاول من بعد.",
      suggestions: []
    }
  }
};


export const getSmartSalarySplit = async (
  salary: number,
  city: string,
  expenses: { name: string; amount: number }[],
  goals: string
): Promise<SmartSplitResponse> => {
  try {
    const prompt = `
    User Salary: ${salary} MAD
    City: ${city}
    Fixed Expenses List: ${JSON.stringify(expenses)}
    Financial Goals/Notes: "${goals}"

    Analyze this financial situation. Calculate total fixed expenses. 
    If (Salary - Total Expenses) > 0, suggest how to split the remaining amount between:
    1. Savings (based on Goals)
    2. Lifestyle / Pocket Money
    3. Emergency Fund
    
    Provide a clear JSON breakdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using standard model for logic
      contents: prompt,
      config: {
        systemInstruction: SALARY_SPLITTER_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SmartSplitResponseSchema,
      },
    });

    const jsonText = response.text.trim().replace(/^```json\s*/, "").replace(/```$/, "");
    const parsed = JSON.parse(jsonText);

    // Sanitize
    if (parsed) {
      parsed.advice = ensureString(parsed.advice);
      if (Array.isArray(parsed.warnings)) {
        parsed.warnings = parsed.warnings.map(ensureString);
      }
      if (Array.isArray(parsed.allocations)) {
        parsed.allocations = parsed.allocations.map((a: any) => ({
          ...a,
          note: ensureString(a.note)
        }));
      }
    }
    
    return parsed as SmartSplitResponse;

  } catch (error) {
    console.error("Smart Splitter Error", error);
    throw new Error("Failed to generate split");
  }
};