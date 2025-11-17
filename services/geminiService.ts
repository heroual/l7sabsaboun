import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import GeminiAction to use enum values for type safety.
import { FinanceState, GeminiResponse, GeminiResponseSchema, GeminiAction, PublicGeminiResponse, PublicGeminiResponseSchema, ChatMessage } from '../types';

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
ملي تزيد شي مصروف، صنفو فواحد من هاد الفئات: 'يومية'، 'تقضية ديال الشهر'، 'فواتير شهرية'، 'سنوية'.
التاريخ ديال اليوم هو ${new Date().toLocaleDateString('en-CA')}. استعملو للمصاريف والمداخिल الجديدة.
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


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
    return parsedResponse;
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
    
    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as PublicGeminiResponse;
    return parsedResponse;

  } catch (error) {
    console.error("Error calling public Gemini API:", error);
    return {
      responseMessage: "سمح ليا، وقع شي خطأ تقني. عاود حاول من بعد.",
    }
  }
};
