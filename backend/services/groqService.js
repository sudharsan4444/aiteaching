const Groq = require("groq-sdk");
const embeddingService = require("./embeddingService");

const rawKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: rawKey.trim() });

if (rawKey) {
    console.log(`AI Service initialized with key: ${rawKey.trim().substring(0, 7)}...${rawKey.trim().slice(-4)}`);
} else {
    console.error("GROQ_API_KEY is missing from environment variables!");
}

const getEmbedding = async (text) => {
    return await embeddingService.getEmbedding(text);
};

const callGroq = async (options) => {
    try {
        return await groq.chat.completions.create(options);
    } catch (error) {
        if (error.status === 401) {
            throw new Error("Invalid Groq API Key. Please check your backend/.env file and get a new key from https://console.groq.com/keys");
        }
        throw error;
    }
};

const generateContent = async (prompt) => {
    const response = await callGroq({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
};

/**
 * Generate a quiz STRICTLY from the provided material context.
 * - 60% MCQ (4 options, 1 correct), 40% DESCRIPTIVE
 * - Questions must be application/conceptual, NOT definition recitation
 * - NEVER mention the material name/code in questions
 * - Each call should produce UNIQUE questions (avoid repeats across generations)
 */
const generateQuiz = async (materialTitle, count, difficulty, context = "", usedQuestions = []) => {
    const mcqCount = Math.round(count * 0.6);
    const descCount = count - mcqCount;

    const avoidList = usedQuestions.length > 0
        ? `\n\nPREVIOUSLY USED QUESTION PROMPTS (DO NOT REPEAT THESE - generate entirely different questions):\n${usedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        : '';

    const contextBlock = context && context.trim().length > 50
        ? `SOURCE MATERIAL CONTEXT (use ONLY this content to create questions):\n${context}`
        : `NOTE: No specific context is available. Generate conceptual questions about general principles in this subject area.`;

    let prompt = `You are a senior educator and assessment expert. Your task is to create a high-quality, application-focused quiz.

ABSOLUTE RULES — VIOLATING ANY RULE INVALIDATES THE ENTIRE RESPONSE:
1. Generate EXACTLY ${mcqCount} MCQ questions and EXACTLY ${descCount} DESCRIPTIVE questions.
2. ALL questions MUST be grounded EXCLUSIVELY in the SOURCE MATERIAL CONTEXT provided below. Do NOT use outside knowledge.
3. QUESTION STYLE — THIS IS CRITICAL:
   - DO NOT ask students to recite definitions, copy text, or state facts verbatim from the material.
   - DO ask questions that test conceptual understanding, application, analysis, cause-and-effect, comparison, or problem-solving.
   - You MAY reframe concepts into new scenarios or situations to test deeper understanding — but the answer must still come from the material.
   - Example BAD question: "What is the definition of X?" (copy-paste)
   - Example GOOD question: "If Y condition occurs, what would happen to X according to the material? Why?"
4. NEVER mention the material title, file name, subject code, document name, section number, or page in any question or answer.
5. MCQ questions MUST have EXACTLY 4 plausible answer options — wrong options should be tempting but clearly incorrect to a student who understood the concept.
6. Difficulty level: ${difficulty} — Easy=recall+apply, Medium=analyze+evaluate, Hard=synthesize+create connections.
7. For MCQ: correctOptionIndex is 0-based (0=first option, 1=second, 2=third, 3=fourth).
8. For DESCRIPTIVE: expectedAnswer must list the KEY CONCEPTS the student must demonstrate understanding of — not a quote from the text.
9. Each question MUST have a topic field (specific sub-topic or concept being tested, e.g., "Caching Strategies", "OSI Layer 3").
10. Assign maxPoints: MCQ=5, DESCRIPTIVE=10.
11. Generate UNIQUE questions different from any previously used ones.
${avoidList}

${contextBlock}

Return ONLY a valid JSON array (no markdown, no explanation). Each element must have:
{
  "type": "MCQ" or "DESCRIPTIVE",
  "prompt": "Application/conceptual question text",
  "options": ["Option A", "Option B", "Option C", "Option D"] (MCQ only — exactly 4),
  "correctOptionIndex": 0 (MCQ only — 0-based index of correct option),
  "expectedAnswer": "Key concepts and understanding the student must demonstrate" (DESCRIPTIVE only),
  "difficulty": "${difficulty}",
  "topic": "Specific concept or sub-topic being tested",
  "maxPoints": 5 or 10
}`;

    const response = await callGroq({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    const questions = Array.isArray(content) ? content : (content.questions || content.quiz || []);

    // Assign unique IDs to each question
    return questions.map((q, i) => ({ ...q, id: `q_${Date.now()}_${i}` }));
};

const evaluateSubmission = async (assessmentTitle, questions, studentAnswers) => {
    const promptData = questions.map((q, i) => ({
        questionIndex: i + 1,
        question: q.prompt,
        type: q.type,
        topic: q.topic || 'General',
        studentAnswer: studentAnswers[q.id],
        correctAnswer: q.type === 'MCQ'
            ? q.options[q.correctOptionIndex]
            : q.expectedAnswer || "Evaluate based on key concepts",
        maxPoints: q.maxPoints || (q.type === 'MCQ' ? 5 : 10)
    }));

    const prompt = `Evaluate this student submission for "${assessmentTitle}" with precision.

Questions & Answers:
${JSON.stringify(promptData, null, 2)}

Grading Protocol:
1. MCQ: Full marks if correct option selected, 0 otherwise.
2. DESCRIPTIVE: Award marks proportional to how many key concepts are present. Partial credit for partial answers.
3. For each question, provide: questionIndex, pointsAwarded, maxPoints, correct (boolean for MCQ), feedback (1-2 sentence explanation).
4. Compute total "score" as sum of all pointsAwarded.
5. Provide overall "feedback" as 2-3 sentences summarizing strong points and areas to improve.

Return ONLY valid JSON:
{
  "score": <total number>,
  "feedback": "<overall feedback>",
  "breakdown": [
    { "questionIndex": 1, "pointsAwarded": 5, "maxPoints": 5, "correct": true, "feedback": "..." },
    ...
  ]
}`;

    const response = await callGroq({
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
