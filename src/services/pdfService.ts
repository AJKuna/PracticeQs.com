// services/pdfService.ts
import jsPDF from 'jspdf';

export interface PDFOptions {
  subject: string;
  topic: string;
  includeAnswers: boolean;
  studentName?: string;
}

export const generateQuestionsPDF = (questions: Question[], options: PDFOptions): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${options.subject} - ${options.topic}`, margin, yPosition);
  yPosition += 15;

  if (options.studentName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${options.studentName}`, margin, yPosition);
    yPosition += 10;
  }

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Questions
  questions.forEach((question, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number and text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. `, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const questionLines = doc.splitTextToSize(question.question, maxWidth - 15);
    doc.text(questionLines, margin + 15, yPosition);
    yPosition += questionLines.length * 5 + 10;

    // Answer (if included)
    if (options.includeAnswers) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Answer:', margin + 10, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      const answerLines = doc.splitTextToSize(question.answer, maxWidth - 20);
      doc.text(answerLines, margin + 10, yPosition);
      yPosition += answerLines.length * 4;

      if (question.explanation) {
        yPosition += 3;
        doc.setFont('helvetica', 'italic');
        doc.text('Explanation:', margin + 10, yPosition);
        yPosition += 4;
        
        const explanationLines = doc.splitTextToSize(question.explanation, maxWidth - 20);
        doc.text(explanationLines, margin + 10, yPosition);
        yPosition += explanationLines.length * 4;
      }
    } else {
      // Add space for answers
      yPosition += 20;
    }
    
    yPosition += 10; // Space between questions
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Download the PDF
  const filename = `${options.subject}_${options.topic}_questions_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export function generateAnswerKeyPDF(questions: Question[], options: PDFOptions): void {
    generateQuestionsPDF(questions, { ...options, includeAnswers: true });
  }