import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Users, CheckCircle, ArrowRight, Calculator, Microscope, Book, Globe, Cpu } from 'lucide-react';

const PracticeQuestionsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Practice Questions Generator | GCSE, KS3 & A-Level | All Subjects | Practice Qs';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Generate unlimited practice questions for GCSE, KS3 and A-Level. All subjects covered: Maths, Science, English, Geography, History, Computer Science. Free question generator with detailed solutions.');
    }

    // Add structured data for this specific page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Practice Qs - Practice Questions Generator",
      "description": "AI-powered practice question generator covering all major educational subjects and exam levels",
      "url": "https://www.practiceqs.com/practice-questions",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Practice Qs",
        "url": "https://www.practiceqs.com"
      },
      "educationalLevel": ["KS3", "GCSE", "A-Level"],
      "teaches": [
        "Mathematics", "Physics", "Chemistry", "Biology", "English Language", 
        "English Literature", "Geography", "History", "Computer Science", "Physical Education"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Practice Questions by Subject",
        "itemListElement": [
          {
            "@type": "Course",
            "name": "Mathematics Practice Questions",
            "description": "Generate algebra, geometry, statistics practice questions"
          },
          {
            "@type": "Course",
            "name": "Science Practice Questions", 
            "description": "Physics, Chemistry and Biology practice questions"
          },
          {
            "@type": "Course",
            "name": "English Practice Questions",
            "description": "Language and Literature practice questions"
          }
        ]
      }
    });
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => {
        if (s.innerHTML.includes('Practice Questions Generator')) {
          s.remove();
        }
      });
    };
  }, []);

  const subjects = [
    { 
      name: 'Mathematics', 
      description: 'Algebra, geometry, statistics, calculus',
      icon: Calculator,
      color: 'blue',
      route: '/generator/mathematics',
      topics: ['Equations', 'Graphs', 'Probability', 'Trigonometry']
    },
    { 
      name: 'Physics', 
      description: 'Forces, energy, waves, electricity',
      icon: Microscope,
      color: 'purple',
      route: '/generator/physics',
      topics: ['Motion', 'Circuits', 'Radiation', 'Magnetism']
    },
    { 
      name: 'Chemistry', 
      description: 'Atoms, reactions, organic chemistry',
      icon: Microscope,
      color: 'green',
      route: '/generator/chemistry',
      topics: ['Bonding', 'Acids & Bases', 'Organic', 'Analysis']
    },
    { 
      name: 'Biology', 
      description: 'Cells, genetics, ecology, human body',
      icon: Microscope,
      color: 'emerald',
      route: '/generator/biology',
      topics: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution']
    },
    { 
      name: 'English Language and Literature', 
      description: 'Reading comprehension, writing skills',
      icon: Book,
      color: 'red',
      route: '/generator/english-language',
      topics: ['Analysis', 'Creative Writing', 'Grammar', 'Comprehension'],
      comingSoon: true
    },
    { 
      name: 'Geography', 
      description: 'Physical geography, human geography',
      icon: Globe,
      color: 'yellow',
      route: '/generator/geography',
      topics: ['Climate', 'Development', 'Hazards', 'Urbanisation']
    },
    { 
      name: 'Computer Science', 
      description: 'Programming, algorithms, data structures',
      icon: Cpu,
      color: 'indigo',
      route: '/generator/computer-science',
      topics: ['Algorithms', 'Programming', 'Networks', 'Databases']
    },
    { 
      name: 'History', 
      description: 'Modern history, historical analysis',
      icon: Book,
      color: 'amber',
      route: '/generator/history',
      topics: ['World Wars', 'Cold War', 'Social Change', 'Politics']
    }
  ];

  const examLevels = ['KS3', 'GCSE', 'A-Level', 'University'];
  const examBoards = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Cambridge'];

  const handleSubjectClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 py-16" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Practice Questions Generator
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-700">
              Generate unlimited practice questions for any subject, any level
            </p>
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: '#e6f0ff' }}>
              <p className="text-lg text-gray-800">
                ✅ 10+ Subjects • ✅ All exam boards • ✅ Detailed solutions • ✅ Free to use
              </p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg inline-flex items-center gap-2"
            >
              Start Generating Questions <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Key Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Practice Questions Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Active Learning</h3>
              <p className="text-gray-600">Practice testing improves retention by up to 50% compared to passive reading</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Exam Preparation</h3>
              <p className="text-gray-600">Questions mirror real exam format and difficulty levels</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
              <p className="text-gray-600">Detailed solutions with mark schemes help you learn from mistakes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Subject</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Generate practice questions for any of these subjects</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject, index) => {
              const IconComponent = subject.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all relative ${
                    subject.comingSoon 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:shadow-md cursor-pointer hover:border-blue-300'
                  }`}
                  onClick={() => !subject.comingSoon && handleSubjectClick(subject.route)}
                >
                  {subject.comingSoon && (
                    <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </div>
                  )}
                  <div className={`inline-flex p-3 bg-${subject.color}-100 rounded-lg mb-4`}>
                    <IconComponent className={`h-6 w-6 text-${subject.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {subject.topics.slice(0, 2).map((topic, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exam Levels & Boards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">More Exam Levels Coming Soon</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {examLevels.map((level) => (
                  <div key={level} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                    {level}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">All Exam Boards</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {examBoards.map((board) => (
                  <div key={board} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                    {board}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How to Generate Practice Questions</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-3">Choose Subject</h3>
              <p className="text-gray-600">Select from maths, sciences, English, and more</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-3">Pick Topic</h3>
              <p className="text-gray-600">Choose specific topics you want to practice</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-3">Set Difficulty</h3>
              <p className="text-gray-600">Easy, medium, or hard to match your level</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold mb-3">Generate & Practice</h3>
              <p className="text-gray-600">Get instant questions with detailed solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600">Self-study and exam preparation</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teachers</h3>
              <p className="text-gray-600">Create worksheets and homework</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tutors</h3>
              <p className="text-gray-600">Generate practice materials</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Parents</h3>
              <p className="text-gray-600">Help children with revision</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by Thousands</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Questions Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10+</div>
              <div className="text-gray-600">Subjects Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-gray-600">Exam Boards Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">What subjects can I generate practice questions for?</h3>
              <p className="text-gray-700">We cover all major GCSE subjects including Mathematics, Physics, Chemistry, Biology, English Language, Geography, History, Computer Science, and more.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Are the questions suitable for my exam board?</h3>
              <p className="text-gray-700">Yes! Our AI generates questions specifically aligned to AQA, Edexcel, OCR, WJEC, and Cambridge specifications, ensuring content matches your exact requirements.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Do I need to create an account?</h3>
              <p className="text-gray-700">For unlimited access and additional features, we recommend creating a free account.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">How are the questions different from textbook questions?</h3>
              <p className="text-gray-700">Our AI generates fresh, unique questions each time while following exam board specifications. This means you get unlimited practice with novel problems that still match exam standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 rounded-lg" style={{ backgroundColor: '#e6f0ff' }}>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Start Generating Practice Questions Now</h2>
            <p className="text-xl mb-8 text-gray-700">Join thousands of students and teachers improving their results with Practice Qs</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/home')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Explore Subjects
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PracticeQuestionsPage; 