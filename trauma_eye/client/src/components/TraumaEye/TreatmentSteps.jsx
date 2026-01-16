import React from "react";

const TreatmentSteps = ({ recommendations }) => {
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-red-600 text-white";
      case "URGENT":
        return "bg-orange-500 text-white";
      case "MONITOR":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "🚨";
      case "URGENT":
        return "⚠️";
      case "MONITOR":
        return "👁️";
      default:
        return "📋";
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Treatment Recommendations
        </h3>
        <span
          className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${getUrgencyStyle(
            recommendations.urgency
          )}`}
        >
          <span>{getUrgencyIcon(recommendations.urgency)}</span>
          <span>{recommendations.urgency}</span>
        </span>
      </div>

      {/* Treatment Steps */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>📋</span>
          <span>Step-by-Step First Aid</span>
        </h4>
        <ol className="space-y-3">
          {recommendations.steps.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
            >
              <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {idx + 1}
              </span>
              <span className="text-gray-700 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Warning Signs */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
          <span>⚠️</span>
          <span>Seek Emergency Care If:</span>
        </h4>
        <ul className="space-y-2">
          {recommendations.seek_emergency_if.map((sign, idx) => (
            <li
              key={idx}
              className="text-sm text-red-800 flex items-start gap-2"
            >
              <span className="text-red-600 font-bold">•</span>
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-xs text-gray-600 bg-gray-100 rounded p-3">
        <p className="font-semibold mb-1">Important Notes:</p>
        <ul className="space-y-1 ml-4">
          <li className="list-disc">
            These recommendations are general guidelines only
          </li>
          <li className="list-disc">
            When in doubt, always seek professional medical care
          </li>
          <li className="list-disc">
            Monitor wound daily for signs of infection or worsening
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TreatmentSteps;
