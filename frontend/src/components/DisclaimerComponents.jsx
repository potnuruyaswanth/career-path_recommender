import React, { useState } from 'react';

/**
 * Career Status Indicator Component
 * Shows warnings if career data is deprecated/under review
 */

export function CareerStatusIndicator({ career }) {
  const status = career?.status || 'active';
  const lastVerified = career?.last_verified || '';
  
  if (status === 'active') {
    return null; // No warning needed
  }

  const statusConfig = {
    deprecated: {
      icon: '❌',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      message: 'This career information is deprecated and may not be current.'
    },
    under_review: {
      icon: '⚠️',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      message: 'This career information is under review and may change.'
    },
    experimental: {
      icon: '🔬',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      message: 'This is experimental information. Verify with official sources.'
    }
  };

  const config = statusConfig[status] || statusConfig.under_review;

  return (
    <div className={`${config.bg} border ${config.border} rounded-md p-3 mb-4`}>
      <p className={`${config.text} text-sm font-semibold flex items-center gap-2`}>
        <span>{config.icon}</span>
        {config.message}
      </p>
      {lastVerified && (
        <p className={`${config.text} text-xs mt-1 opacity-75`}>
          Last verified: {lastVerified}
        </p>
      )}
    </div>
  );
}

/**
 * Career Card Component with Status & Disclaimer
 */

export function CareerCard({ career, onSelect }) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Status Indicator */}
      <div className="p-4">
        <CareerStatusIndicator career={career} />
      </div>

      {/* Career Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {career?.display_name || 'Career'}
        </h3>
        
        {career?.short_description && (
          <p className="text-slate-600 text-sm mb-4">
            {career.short_description}
          </p>
        )}

        {/* Salary Band (if available) */}
        {career?.salary_band && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-xs font-semibold text-green-700 mb-2">💰 SALARY BANDS</p>
            <div className="text-sm text-green-700 space-y-1">
              <p>Entry: {career.salary_band.entry}</p>
              <p>Mid-level: {career.salary_band.mid}</p>
              <p>Senior: {career.salary_band.senior}</p>
              <p className="text-xs italic mt-2 text-green-600">
                Varies by skill, location, and organization.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onSelect?.(career)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
          >
            Learn More
          </button>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition text-sm font-medium"
            title="View disclaimer"
          >
            ℹ️
          </button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">⚠️ Important Disclaimer</h2>
            
            <div className="space-y-3 text-sm text-slate-700 mb-6">
              <p>This platform provides career information for guidance purposes only.</p>
              
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="font-semibold text-orange-900 mb-2">No Guarantees:</p>
                <ul className="text-orange-900 space-y-1 ml-3">
                  <li>✗ Admissions are not guaranteed</li>
                  <li>✗ Exam success is not guaranteed</li>
                  <li>✗ Job placement is not guaranteed</li>
                  <li>✗ Salary varies significantly</li>
                </ul>
              </div>

              <p className="font-semibold">Always verify with official sources.</p>
              
              <p className="text-xs text-slate-500">
                Rules may change. Consult official educational institutions and regulatory bodies 
                for the latest information.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded hover:bg-slate-200 transition font-medium"
              >
                Close
              </button>
              <a
                href="/disclaimer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-center"
              >
                Full Disclaimer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Chatbot Disclaimer Message
 * Show this when bot provides career information
 */

export function ChatbotDisclaimerMessage() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
      <p className="text-sm text-blue-900 flex items-start gap-2">
        <span className="text-lg">ℹ️</span>
        <span>
          <strong>Disclaimer:</strong> This information is for guidance only. 
          Rules may vary by institution. Please verify with official sources.{' '}
          <a href="/disclaimer" className="underline font-semibold hover:text-blue-700">
            Learn more
          </a>
        </span>
      </p>
    </div>
  );
}

/**
 * Data Health Badge
 * Shows when data was last verified
 */

export function DataHealthBadge({ career }) {
  const lastVerified = career?.last_verified;
  if (!lastVerified) return null;

  // Calculate months since verification
  const [year, month] = lastVerified.split('-').map(Number);
  const verifiedDate = new Date(year, month - 1);
  const monthsAgo = Math.floor(
    (new Date() - verifiedDate) / (1000 * 60 * 60 * 24 * 30)
  );

  let badge;
  if (monthsAgo < 3) {
    badge = { color: 'green', text: 'Recently verified' };
  } else if (monthsAgo < 6) {
    badge = { color: 'yellow', text: 'Verify soon' };
  } else {
    badge = { color: 'red', text: 'Data aging' };
  }

  return (
    <span className={`text-xs px-2 py-1 rounded bg-${badge.color}-100 text-${badge.color}-800 font-semibold`}>
      {badge.text}
    </span>
  );
}
