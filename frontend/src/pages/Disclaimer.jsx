import React from 'react';

/**
 * Disclaimer Page Component
 * Legal safety & transparency required for live career guidance apps
 * 
 * Include link in:
 * - Footer
 * - Career cards
 * - Chatbot disclaimer
 */

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Disclaimer & Important Information
          </h1>
          <p className="text-slate-600 text-lg">
            Please read carefully before using this platform
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">

          {/* 1. Information Purpose */}
          <section className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              📋 Informational Purpose
            </h2>
            <p className="text-slate-700 leading-relaxed">
              This platform provides career guidance, educational pathways, and 
              information about various professions <strong>for informational purposes only</strong>. 
              It is designed to help you explore career options and understand educational 
              requirements, but it is not a substitute for professional career counseling.
            </p>
          </section>

          {/* 2. No Guarantees */}
          <section className="border-l-4 border-orange-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              ⚠️ No Guarantees
            </h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Admissions:</strong> Following any career path does not guarantee admission to educational institutions.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Exam Success:</strong> This platform does not guarantee success in competitive exams (NEET, JEE, UPSC, etc.).</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Job Placement:</strong> Career guidance does not guarantee employment or job placement.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 font-bold">•</span>
                <span><strong>Salary:</strong> Salary ranges provided are estimates and may vary significantly based on skills, location, experience, and organization.</span>
              </li>
            </ul>
          </section>

          {/* 3. Data Accuracy */}
          <section className="border-l-4 border-green-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              ✓ Data Accuracy & Updates
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              We strive to keep all information current and accurate. However:
            </p>
            <ul className="space-y-2 text-slate-700 ml-4">
              <li>• Eligibility criteria, exam patterns, and requirements change frequently</li>
              <li>• Career landscape evolves with market trends</li>
              <li>• Salary and job market conditions fluctuate</li>
              <li>• Data may become outdated despite best efforts</li>
            </ul>
            <p className="text-slate-700 mt-3 font-semibold">
              Always verify information with official sources before making decisions.
            </p>
          </section>

          {/* 4. Institutional Changes */}
          <section className="border-l-4 border-purple-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              🏫 Rules & Requirements May Change
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Educational institutions, regulatory bodies, and examination boards frequently 
              update their:
            </p>
            <ul className="space-y-2 text-slate-700 ml-4 mt-3">
              <li>• Eligibility requirements</li>
              <li>• Exam syllabi and patterns</li>
              <li>• Course structures and content</li>
              <li>• Admission criteria</li>
              <li>• Career regulations and standards</li>
            </ul>
            <p className="text-slate-700 mt-3">
              We recommend checking official websites of relevant institutions and authorities 
              for the latest and most accurate information.
            </p>
          </section>

          {/* 5. Professional Advice */}
          <section className="border-l-4 border-red-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              👨‍💼 Not a Substitute for Professional Advice
            </h2>
            <p className="text-slate-700 leading-relaxed">
              For important career and educational decisions, we strongly recommend consulting:
            </p>
            <ul className="space-y-2 text-slate-700 ml-4 mt-3">
              <li>• Qualified career counselors</li>
              <li>• School/college guidance departments</li>
              <li>• Professional bodies in your field of interest</li>
              <li>• Industry professionals and mentors</li>
              <li>• Official educational institution websites</li>
            </ul>
          </section>

          {/* 6. User Responsibility */}
          <section className="border-l-4 border-yellow-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              📝 Your Responsibility
            </h2>
            <p className="text-slate-700 leading-relaxed">
              By using this platform, you acknowledge that:
            </p>
            <ul className="space-y-2 text-slate-700 ml-4 mt-3">
              <li>• You use this information at your own discretion</li>
              <li>• You are responsible for verifying all information independently</li>
              <li>• You will consult official sources before making decisions</li>
              <li>• Career decisions are ultimately yours and your family's responsibility</li>
            </ul>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="border-l-4 border-slate-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              ⚖️ Limitation of Liability
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The creators and operators of this platform are not responsible for:
            </p>
            <ul className="space-y-2 text-slate-700 ml-4 mt-3">
              <li>• Any decisions made based on information provided</li>
              <li>• Exam failures or admission rejections</li>
              <li>• Job placement outcomes</li>
              <li>• Changes in exam patterns or eligibility</li>
              <li>• Inaccuracies in third-party data</li>
              <li>• Technical errors or system downtime</li>
            </ul>
          </section>

          {/* 8. Contact & Feedback */}
          <section className="border-l-4 border-indigo-500 pl-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              💬 Feedback & Corrections
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We welcome feedback about inaccurate or outdated information. 
              If you find an error, please let us know so we can correct it.
            </p>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-600 text-center mb-6">
            By using this platform, you acknowledge that you have read and understood this disclaimer.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              → Home
            </button>
          </div>
        </div>

      </div>

      {/* Quick Links */}
      <div className="mt-12 max-w-3xl mx-auto text-center">
        <p className="text-slate-600 mb-4">Need help?</p>
        <div className="flex gap-4 justify-center flex-wrap text-sm">
          <a href="/faq" className="text-blue-600 hover:underline">FAQ</a>
          <span className="text-slate-400">•</span>
          <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a>
          <span className="text-slate-400">•</span>
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <span className="text-slate-400">•</span>
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
        </div>
      </div>

    </div>
  );
}
