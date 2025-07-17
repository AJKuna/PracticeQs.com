import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Users, ArrowRight, TrendingUp, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const NewLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const screenshots = ['/step1-screenshot.png', '/step2-screenshot.png', '/step3-screenshot.png'];
  const currentImageIndex = selectedImage ? screenshots.indexOf(selectedImage) : -1;

  const handleGetStarted = () => {
    navigate('/home');
  };

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setSelectedImage(screenshots[currentImageIndex - 1]);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < screenshots.length - 1) {
      setSelectedImage(screenshots[currentImageIndex + 1]);
    }
  };

  // Floating emoji data with more emojis and bigger sizes
  const floatingEmojis = [
    // Top row
    { emoji: '📐', size: '48px', left: '15%', top: '15%', delay: '0s', zIndex: 1 },
    { emoji: '🧪', size: '50px', left: '85%', top: '15%', delay: '2s', zIndex: 1 },
    
    // Middle row (sides)
    { emoji: '🧬', size: '44px', left: '5%', top: '45%', delay: '3s', zIndex: 2 },
    { emoji: '🏛️', size: '46px', left: '95%', top: '45%', delay: '4s', zIndex: 1 },
    
    // Lower middle row
    { emoji: '🌍', size: '52px', left: '20%', top: '60%', delay: '5s', zIndex: 1 },
    { emoji: '💻', size: '48px', left: '80%', top: '60%', delay: '6s', zIndex: 2 },
    
    // Bottom row
    { emoji: '📚', size: '44px', left: '10%', top: '80%', delay: '7s', zIndex: 1 },
    { emoji: '🔬', size: '46px', left: '35%', top: '85%', delay: '1.5s', zIndex: 2 },
    { emoji: '🎨', size: '50px', left: '65%', top: '85%', delay: '2.5s', zIndex: 1 },
    { emoji: '🎭', size: '42px', left: '90%', top: '80%', delay: '3.5s', zIndex: 2 },
    
    // Additional spacing emoji
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Emoji Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(-1deg);
          }
          75% {
            transform: translateY(-20px) rotate(1deg);
          }
        }
        
        .floating-emoji {
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Previous Image Arrow */}
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            
            {/* Next Image Arrow */}
            {currentImageIndex < screenshots.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            
            <img 
              src={selectedImage} 
              alt="Enlarged screenshot"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img className="h-16 w-auto mr-3" src="/logo.svg" alt="Practice Qs" />
            </div>
            <div className="flex items-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating Emojis */}
        {floatingEmojis.map((item, index) => (
          <div
            key={index}
            className="floating-emoji absolute opacity-60 text-4xl"
            style={{
              left: item.left,
              top: item.top,
              fontSize: item.size,
              animationDelay: item.delay,
              zIndex: item.zIndex
            }}
          >
            {item.emoji}
          </div>
        ))}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Practice Qs
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
            AI-generated exam questions. Based only on what you need to know.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Don't fall behind this summer. Get practicing
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <div className="mt-6">
            <p className="text-sm text-green-600">✓ Start free.</p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center z-10">
          <ChevronDown className="h-6 w-6 text-gray-400 animate-bounce" />
          <p className="text-xs text-gray-400 mt-1">scroll down</p>
        </div>
      </section>

      {/* Hero Expanded Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Don't fall behind this summer. Generate smart practice questions instantly.
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Practice Qs helps GCSE students study smarter with AI-generated, exam-board-aligned practice questions — complete with mark-by-mark solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Practicing
            </button>
          </div>
        </div>
      </section>

      {/* Screenshot Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg">
            <div className="aspect-video bg-white rounded-lg shadow-md overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                controls
                autoPlay
                muted
                loop
                poster="/demo-thumbnail.jpg"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <source src="/demo-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-center text-gray-600 mt-6 text-sm">
              Choose a subject, type a topic, and get instant, spec-based questions with worked solutions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Three simple steps to better exam preparation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-full max-w-xl mx-auto mb-6">
                <img 
                  src="/step1-screenshot.png" 
                  alt="Pick your subject screenshot"
                  className="w-full h-auto rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openImageModal('/step1-screenshot.png')}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1) Choose a subject</h3>
              <p className="text-gray-600">e.g. maths, biology, english</p>
            </div>

            <div className="text-center">
              <div className="w-full max-w-xl mx-auto mb-6">
                <img 
                  src="/step2-screenshot.png" 
                  alt="Type your topic screenshot"
                  className="w-full h-auto rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openImageModal('/step2-screenshot.png')}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2) Choose a topic</h3>
              <p className="text-gray-600">e.g. solving equations</p>
            </div>

            <div className="text-center">
              <div className="w-full max-w-xl mx-auto mb-6">
                <img 
                  src="/step3-screenshot.png" 
                  alt="Get instant questions screenshot"
                  className="w-full h-auto rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openImageModal('/step3-screenshot.png')}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3) Get instant questions + detailed solutions</h3>
              <p className="text-gray-600">Mark-by-mark breakdowns included</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Practice Qs Different */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Makes Practice Qs Different?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tailored to Exam Boards</h3>
                  <p className="text-gray-600">
                    Only covers topics from official specifications (AQA, Edexcel, OCR etc.). 
                    We're not affiliated with exam boards — just laser-focused on what students need to know.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Solutions Show Where Marks Are Awarded</h3>
                  <p className="text-gray-600">
                    Students don't just see the final answer — they learn how to get the marks.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">15 Free Questions a Day</h3>
                  <p className="text-gray-600">
                    Get started instantly with no commitment. Upgrade anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Printable Worksheets</h3>
                  <p className="text-gray-600">
                    Download your questions and solutions as clean, printable PDFs — lined or square paper.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Freemium, No Tricks</h3>
                  <p className="text-gray-600">
                    Keep using it for free. Unlimited questions for £5/month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Practice Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Why Practice Questions Work
          </h2>

          {/* Performance Comparison Graph */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Exam Performance: Practice Questions vs Passive Methods</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={[
                    { method: 'Passive Methods', performance: 67 },
                    { method: 'Practice Questions', performance: 100 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" tick={{ fontWeight: 'bold', fontSize: 16 }} />
                  <YAxis domain={[0, 110]} tick={{ fontWeight: 'bold', fontSize: 14 }} />
                  <Tooltip formatter={(value: number | string) => `${value}%`} />
                  <Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={4} dot={{ r: 10, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}>
                    <LabelList dataKey="performance" position="top" formatter={(label: React.ReactNode): React.ReactNode => `${label}%`} style={{ fontWeight: 'bold', fontSize: 18, fill: '#2563eb' }} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-4 text-base text-gray-700 font-semibold">
                <span className="text-blue-700 font-bold">Practice Questions</span> boost exam performance by up to <span className="font-bold">50%</span> compared to passive revision methods such as rereading or highlighting.
                (<a href="https://www.science.org/doi/10.1126/science.1199327" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Roediger & Karpicke, 2006</a>; <a href="https://journals.sagepub.com/doi/10.1177/1529100612453266" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Dunlosky et al., 2013</a>).
                <br />
              </p>
            </div>
            <div className="flex items-center justify-center mb-6">
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-lg text-gray-700 mb-6">
              🧠 According to a review of over <strong>700 studies</strong>, practice testing and active recall are consistently ranked as the 
              most effective learning strategies for long-term retention (<a href="https://journals.sagepub.com/doi/10.1177/1529100612453266" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Dunlosky et al., 2013</a>; <a href="https://www.science.org/doi/10.1126/science.1199327" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Karpicke & Blunt, 2011</a>).
            </p>
            <p className="text-lg text-gray-700">
              ✅ Students who regularly do topic-specific questions based on the actual curriculum not only retain more — 
              they also perform better under exam conditions.
            </p>
          </div>

          <p className="text-xl font-semibold text-gray-900">
            Bottom line: The most effective way to study isn't studying harder. It's practising smarter.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who It's For
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Students studying independently</h3>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Parents helping their kids revise</h3>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teachers who want quick worksheet generators</h3>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutors looking for homework questions</h3>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I know the questions are based on the exam spec?</h3>
              <p className="text-gray-700">
                The AI has been trained on subject-specific specifications — so it only generates questions on examinable content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is this endorsed by an exam board?</h3>
              <p className="text-gray-700">
                No — Practice Qs is an independent revision tool designed to support students and teachers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Are the solutions detailed?</h3>
              <p className="text-gray-700">
                Yes — they show step-by-step working and indicate where marks are awarded, based on mark scheme logic.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is it free?</h3>
              <p className="text-gray-700">
                You get 15 questions a day for free. If you want unlimited questions, it's just £5/month.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I print the questions?</h3>
              <p className="text-gray-700">
                Yes! You can download PDFs with or without solutions, formatted neatly on lined or square paper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            🎯 Don't fall behind this summer. Get generating.
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start now — 15 free questions every day.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img className="h-14 w-auto mr-3" src="/logo.svg" alt="Practice Qs" />
                <span className="text-xl font-bold">Practice Qs</span>
              </div>
              <p className="text-gray-600 mb-4">
                AI-generated exam questions based only on what you need to know.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/privacy')} 
                  className="block w-full text-left px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate('/terms')} 
                  className="block w-full text-left px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => navigate('/contact')} 
                  className="block w-full text-left px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-500">
            <p>© 2025 Practice Qs. All rights reserved.</p>
            <p className="mt-2 text-xs">
              We're committed to safeguarding and promoting the welfare of children. This site is designed for use by adults or with adult supervision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage; 