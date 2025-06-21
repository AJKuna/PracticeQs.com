// services/pdfService.ts
import jsPDF from 'jspdf';
import type { Question } from '../types';

interface PDFOptions {
  showAnswers?: boolean;
  includeAnswers?: boolean;
  title?: string;
  subject?: string;
  topic?: string;
  studentName?: string;
}

export const generateQuestionsPDF = (questions: Question[], options: PDFOptions): void => {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = doc.internal.pageSize.width - 2 * margin;
  let yPosition = margin;

  // Title
  doc.setFontSize(18);
  doc.text(options.title || 'Practice Questions', margin, yPosition);
  yPosition += 10;

  // Subject and topic
  doc.setFontSize(12);
  doc.text(`Subject: ${options.subject || 'General'}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Topic: ${options.topic || 'Mixed'}`, margin, yPosition);
  yPosition += 15;

  if (options.studentName) {
    doc.setFontSize(10);
    doc.text(`Student: ${options.studentName}`, margin, yPosition);
    yPosition += 15;
  }

  // Questions
  questions.forEach((question, index) => {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number and text
    doc.setFontSize(12);
    doc.text(`Question ${index + 1}:`, margin, yPosition);
    yPosition += 7;

    const questionLines = doc.splitTextToSize(question.question, maxWidth);
    questionLines.forEach((line: string) => {
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 15; // Space between questions
  });

  doc.save('practice-questions.pdf');
};

export function generateAnswerKeyPDF(questions: Question[], options: PDFOptions): void {
  // For now, just generate the questions PDF since Question interface doesn't have answers
  generateQuestionsPDF(questions, options);
}