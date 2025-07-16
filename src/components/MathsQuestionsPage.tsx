import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, BookOpen, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';

const MathsQuestionsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'GCSE Maths Questions Generator | Free Practice Questions | Practice Qs';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Generate unlimited GCSE maths questions with detailed solutions. Covers algebra, geometry, statistics, probability and more. Aligned to AQA, Edexcel, OCR exam boards. Free to use.');
    }

    // Add structured data for this specific page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "GCSE Mathematics Practice Questions",
      "description": "Generate unlimited GCSE maths practice questions covering all exam board specifications including algebra, geometry, statistics, and more",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Practice Qs",
        "url": "https://www.practiceqs.com"
      },
      "educationalLevel": "Secondary Education",
      "courseCode": "GCSE Mathematics",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "PT",
        "instructor": {
          "@type": "Organization",
          "name": "Practice Qs AI"
        }
      },
      "about": [
        "Algebra", "Geometry", "Statistics", "Probability", "Number", "Ratio and Proportion"
      ],
      "teaches": [
        "Solving equations", "Quadratic functions", "Trigonometry", "Coordinate geometry", 
        "Data analysis", "Probability calculations", "Algebraic manipulation"
      ]
    });
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => {
        if (s.innerHTML.includes('GCSE Mathematics Practice Questions')) {
          s.remove();
        }
      });
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/generator/mathematics');
  };

  const mathsTopics = [
    { name: 'Algebra', description: 'Equations, inequalities, graphs', icon: '📐' },
    { name: 'Geometry', description: 'Shapes, angles, area, volume', icon: '📊' },
    { name: 'Statistics', description: 'Data analysis, averages, probability', icon: '📈' },
    { name: 'Number', description: 'Fractions, decimals, percentages', icon: '🔢' },
    { name: 'Ratio & Proportion', description: 'Ratios, rates, percentages', icon: '⚖️' },
    { name: 'Trigonometry', description: 'Sin, cos, tan, Pythagoras', icon: '📐' }
  ];

  const examBoards = ['AQA', 'Edexcel', 'OCR', 'WJEC'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              GCSE Maths Questions Generator
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-100">
              Generate unlimited practice questions for every GCSE maths topic
            </p>
            <p className="text-lg mb-8 text-blue-100">
              ✅ All exam boards (AQA, Edexcel, OCR, WJEC) • ✅ Detailed solutions • ✅ Instant generation
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg inline-flex items-center gap-2"
            >
              Start Generating Questions <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Key Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Use Our Maths Question Generator?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Exam Board Aligned</h3>
              <p className="text-gray-600">Questions follow AQA, Edexcel, OCR, and WJEC specifications exactly</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Detailed Solutions</h3>
              <p className="text-gray-600">Step-by-step workings with mark schemes for every question</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Unlimited Practice</h3>
              <p className="text-gray-600">Generate as many questions as you need for any topic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Maths Topics Covered */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">All GCSE Maths Topics Covered</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Generate questions for every area of the GCSE mathematics specification</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mathsTopics.map((topic, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{topic.icon}</span>
                  <h3 className="text-lg font-semibold">{topic.name}</h3>
                </div>
                <p className="text-gray-600">{topic.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">
              <strong>120+ subtopics available</strong> including: Solving equations, Quadratic graphs, 
              Trigonometry, Probability trees, Statistical analysis, and much more.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Maths Topics
            </button>
          </div>
        </div>
      </section>

      {/* Exam Boards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">All GCSE Exam Boards Supported</h2>
          <p className="text-lg text-gray-600 mb-8">Our questions are tailored to match the specific requirements of each exam board</p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {examBoards.map((board) => (
              <div key={board} className="bg-white border-2 border-gray-200 rounded-lg px-6 py-4 font-semibold text-lg hover:border-blue-300 transition-colors">
                {board}
              </div>
            ))}
          </div>
          
          <p className="text-gray-600">
            Each question follows the command words, topic coverage, and marking criteria specific to your chosen exam board.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How to Generate Maths Questions</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Topic</h3>
              <p className="text-gray-600">Select from algebra, geometry, statistics, or any other GCSE maths area</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Set Difficulty</h3>
              <p className="text-gray-600">Pick easy, medium, or hard questions to match your level</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Generate & Practice</h3>
              <p className="text-gray-600">Get instant questions with step-by-step solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Are the maths questions suitable for all GCSE exam boards?</h3>
              <p className="text-gray-700">Yes! Our AI generates questions specifically aligned to AQA, Edexcel, OCR, and WJEC GCSE Mathematics specifications, ensuring content matches your exact requirements.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">How many maths questions can I generate for free?</h3>
              <p className="text-gray-700">Free users can generate up to 15 questions per day. Premium users get unlimited question generation plus additional features like bulk downloads.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Do the questions come with worked solutions?</h3>
              <p className="text-gray-700">Absolutely! Every question includes detailed step-by-step solutions with mark allocations, helping you understand exactly how to solve each problem.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Can I use these questions for teaching?</h3>
              <p className="text-gray-700">Yes! Teachers and tutors regularly use our platform to create custom worksheets and homework assignments. It's perfect for lesson planning and revision materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Start Generating GCSE Maths Questions Now</h2>
          <p className="text-xl mb-8 text-gray-600">Join thousands of students and teachers using Practice Qs for better exam preparation</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Generate Questions Free
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Sign Up for Premium
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MathsQuestionsPage; 