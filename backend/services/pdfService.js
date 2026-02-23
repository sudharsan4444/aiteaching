const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const generateAnswerKeyPDF = async (assessment) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;

    let y = height - 50;

    // Title
    page.drawText(assessment.title, {
        x: 50,
        y: y,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
    });
    y -= 30;

    // Subject
    page.drawText(`Subject: ${assessment.topic}`, {
        x: 50,
        y: y,
        size: 14,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
    });
    y -= 40;

    // Questions
    assessment.questions.forEach((q, idx) => {
        if (y < 80) {
            return;
        }

        page.drawText(`${idx + 1}. ${q.prompt}`, {
            x: 50,
            y: y,
            size: fontSize,
            font: boldFont,
            maxWidth: width - 100,
        });
        y -= 20;

        if (q.type === 'MCQ') {
            q.options.forEach((opt, optIdx) => {
                const isCorrect = optIdx === q.correctOptionIndex;
                page.drawText(`   ${String.fromCharCode(65 + optIdx)}. ${opt} ${isCorrect ? '(Correct)' : ''}`, {
                    x: 50,
                    y: y,
                    size: fontSize,
                    font: font,
                    color: isCorrect ? rgb(0, 0.5, 0) : rgb(0, 0, 0),
                });
                y -= 15;
            });
        } else {
            page.drawText(`   (Descriptive Answer Key - check teacher notes)`, {
                x: 50,
                y: y,
                size: fontSize,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
            y -= 15;
        }
        y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

const generateSubmissionReportPDF = async (assessment, submission, student) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let y = height - 50;

    // Title
    page.drawText("ASSESSMENT REPORT", {
        x: 50,
        y: y,
        size: 22,
        font: boldFont,
        color: rgb(0.2, 0.3, 0.8),
    });
    y -= 30;

    // Info
    page.drawText(`Student: ${student.name} (${student.rollNumber || 'N/A'})`, { x: 50, y: y, size: 12, font: boldFont });
    page.drawText(`Date: ${new Date(submission.submittedAt).toLocaleDateString()}`, { x: width - 150, y: y, size: 10, font: font });
    y -= 15;
    page.drawText(`Assessment: ${assessment.title}`, { x: 50, y: y, size: 12, font: font });
    y -= 40;

    // Score
    page.drawRectangle({
        x: 50,
        y: y - 10,
        width: width - 100,
        height: 40,
        color: rgb(0.95, 0.95, 0.98),
        borderColor: rgb(0.8, 0.8, 0.9),
        borderWidth: 1
    });
    page.drawText(`FINAL SCORE: ${submission.score} / ${submission.maxScore}`, {
        x: 70,
        y: y + 5,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.4)
    });
    y -= 60;

    // Feedback
    page.drawText("AI Teacher Feedback:", { x: 50, y: y, size: 11, font: boldFont });
    y -= 15;
    const feedback = submission.feedback || "Good effort.";
    const feedbackLines = feedback.match(/.{1,90}/g) || [feedback];
    feedbackLines.forEach(line => {
        page.drawText(`"${line}"`, { x: 55, y: y, size: 10, font: italicFont, color: rgb(0.3, 0.3, 0.3) });
        y -= 12;
    });
    y -= 30;

    // Breakdown
    page.drawText("Detailed Breakdown:", { x: 50, y: y, size: 11, font: boldFont });
    y -= 20;

    assessment.questions.forEach((q, idx) => {
        if (y < 80) return;

        page.drawText(`${idx + 1}. ${q.prompt}`, { x: 50, y: y, size: 10, font: boldFont, maxWidth: width - 100 });
        y -= 15;

        const answers = submission.answers;
        const studentAns = (answers instanceof Map) ? answers.get(q.id) : answers[q.id];

        if (q.type === 'MCQ') {
            const displayAns = q.options[studentAns] || "No Answer";
            const isCorrect = studentAns === q.correctOptionIndex;
            page.drawText(`Your Answer: ${displayAns}`, { x: 60, y: y, size: 9, font: font, color: isCorrect ? rgb(0, 0.5, 0) : rgb(0.7, 0, 0) });
            y -= 12;
            if (!isCorrect) {
                page.drawText(`Correct Answer: ${q.options[q.correctOptionIndex]}`, { x: 60, y: y, size: 9, font: font, color: rgb(0, 0.4, 0) });
                y -= 12;
            }
        } else {
            const displayAns = studentAns || "No response provided";
            const lines = displayAns.match(/.{1,95}/g) || [displayAns];
            page.drawText("Your Response:", { x: 60, y: y, size: 9, font: boldFont });
            y -= 12;
            lines.slice(0, 3).forEach(line => {
                page.drawText(line, { x: 65, y: y, size: 9, font: font, color: rgb(0.2, 0.2, 0.2) });
                y -= 10;
            });
        }
        y -= 15;
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

module.exports = { generateAnswerKeyPDF, generateSubmissionReportPDF };
