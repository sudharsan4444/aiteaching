const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const getEmbedding = async (text) => {
    const model = "text-embedding-004";
    const result = await genAI.models.embedContent({
        model: model,
        content: text,
    });
    return result.embedding.values;
};

const generateContent = async (prompt) => {
    const model = "gemini-2.0-flash";
    const result = await genAI.models.generateContent({
        model: model,
        contents: prompt,
    });
    return result.text();
};

const generateQuiz = async (topic, count, difficulty) => {
    const model = "gemini-2.0-flash";
    const prompt = `Generate ${count} questions about ${topic} with ${difficulty} difficulty. 
  Mix MCQ and Descriptive types. Include correct answers for MCQs.
  Return ONLY valid JSON array with objects containing: 
  type (MCQ/DESCRIPTIVE), prompt, options (array for MCQ), correctOptionIndex (number for MCQ), difficulty, maxPoints (number).`;

    const result = await genAI.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.text());
};

const evaluateSubmission = async (assessmentTitle, questions, studentAnswers) => {
    const model = "gemini-2.0-flash";
    const promptData = questions.map(q => ({
        question: q.prompt,
        type: q.type,
        studentAnswer: studentAnswers[q.id],
        correctAnswer: q.type === 'MCQ' ? q.options[q.correctOptionIndex] : "Descriptive - use judgment"
    }));

    const prompt = `Evaluate this student's submission for "${assessmentTitle}".
   Data: ${JSON.stringify(promptData)}
   Return valid JSON with keys: score (number), feedback (string).`;

    const result = await genAI.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.text());
};

module.exports = {
    getEmbedding,
    generateContent,
    generateQuiz,
    evaluateSubmission,
    genAI
};
