const Groq = require("groq-sdk");
const embeddingService = require("./embeddingService");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getEmbedding = async (text) => {
    // Now using local free embeddings
    return await embeddingService.getEmbedding(text);
};

const generateContent = async (prompt) => {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
};

const generateQuiz = async (topic, count, difficulty) => {
    const prompt = `Generate ${count} questions about ${topic} with ${difficulty} difficulty. 
  Mix MCQ and Descriptive types. Include correct answers for MCQs.
  Return ONLY valid JSON array with objects containing: 
  type (MCQ/DESCRIPTIVE), prompt, options (array for MCQ), correctOptionIndex (number for MCQ), difficulty, maxPoints (number).`;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    return Array.isArray(content) ? content : (content.questions || content.quiz || []);
};

const evaluateSubmission = async (assessmentTitle, questions, studentAnswers) => {
    const promptData = questions.map(q => ({
        question: q.prompt,
        type: q.type,
        studentAnswer: studentAnswers[q.id],
        correctAnswer: q.type === 'MCQ' ? q.options[q.correctOptionIndex] : "Descriptive - use judgment"
    }));

    const prompt = `Evaluate this student's submission for "${assessmentTitle}".
    Data: ${JSON.stringify(promptData)}
    Return valid JSON with keys: score (number), feedback (string).`;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
};

module.exports = {
    getEmbedding,
    generateContent,
    generateQuiz,
    evaluateSubmission
};
