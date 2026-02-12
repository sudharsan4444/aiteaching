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
        y,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
    });
    y -= 30;

    // Subject
    page.drawText(`Subject: ${assessment.topic}`, {
        x: 50,
        y,
        size: 14,
        font,
        color: rgb(0.3, 0.3, 0.3),
    });
    y -= 40;

    // Questions
    assessment.questions.forEach((q, idx) => {
        if (y < 50) {
            // Add new page if running out of space
            // For MVP we just stop or simplistic handling.
            // Ideally: const newPage = pdfDoc.addPage(); ...
        }

        page.drawText(`${idx + 1}. ${q.prompt}`, {
            x: 50,
            y,
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
                    y,
                    size: fontSize,
                    font,
                    color: isCorrect ? rgb(0, 0.5, 0) : rgb(0, 0, 0),
                });
                y -= 15;
            });
        } else {
            page.drawText(`   (Descriptive Answer Key - check teacher notes)`, {
                x: 50,
                y,
                size: fontSize,
                font: rgb(0.5, 0.5, 0.5),
            });
            y -= 15;
        }
        y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

module.exports = { generateAnswerKeyPDF };
