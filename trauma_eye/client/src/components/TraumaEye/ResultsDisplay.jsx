import React from "react";
import TreatmentSteps from "./TreatmentSteps";

const ResultsDisplay = ({
  result,
  onReset,
  onEmergencyCall,
  onExport,
  onPrint,
}) => {
  // Risk level badge styling
  const getRiskBadgeStyle = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-red-600 text-white border-red-700";
      case "MODERATE":
        return "bg-yellow-500 text-gray-900 border-yellow-600";
      case "LOW":
        return "bg-green-500 text-white border-green-600";
      default:
        return "bg-gray-400 text-white border-gray-500";
    }
  };

  const getInfectionBadgeStyle = (level) => {
    switch (level) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Call Button (if CRITICAL) */}
      {result.risk === "CRITICAL" && (
        <button
          onClick={onEmergencyCall}
          className="w-full py-5 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-xl flex items-center justify-center gap-3 animate-pulse"
          aria-label="Call emergency services"
        >
          <span className="text-3xl">🚨</span>
          <span>CALL 911 NOW</span>
        </button>
      )}

      {/* Risk Level Badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Analysis Results
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        <div
          className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getRiskBadgeStyle(
            result.risk
          )}`}
        >
          {result.risk} RISK
        </div>
      </div>

      {/* Main Message */}
      <div
        className={`p-4 rounded-lg border-l-4 ${
          result.risk === "CRITICAL"
            ? "bg-red-50 border-red-600"
            : result.risk === "MODERATE"
            ? "bg-yellow-50 border-yellow-600"
            : "bg-green-50 border-green-600"
        }`}
      >
        <p className="font-medium text-gray-800">{result.message}</p>
        <p className="text-sm text-gray-600 mt-1">
          Confidence: {(result.confidence * 100).toFixed(0)}%
        </p>
      </div>

      {/* Annotated Image */}
      {result.visual_overlay && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Detected Wound
          </h3>
          <img
            src={result.visual_overlay}
            alt="Annotated wound"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Photo Quality Issues */}
      {result.photo_quality.issues.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            <span>Photo Quality Issues</span>
          </h3>
          <ul className="text-sm text-orange-800 space-y-1">
            {result.photo_quality.issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-orange-700 mt-2">
            Quality Score: {result.photo_quality.quality_score}/100
          </p>
        </div>
      )}

      {/* Wound Types */}
      {result.wound_types && result.wound_types.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Wound Type</h3>
          <ul className="space-y-1">
            {result.wound_types.map((type, idx) => (
              <li
                key={idx}
                className="text-gray-700 bg-white rounded px-3 py-2 border border-gray-200"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Measurements */}
      {result.measurements && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Wound Measurements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-600">Estimated Size</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.measurements.estimated_cm}
              </p>
            </div>
            <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.measurements.size_category}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Infection Analysis */}
      {result.infection_analysis && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Infection Risk</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getInfectionBadgeStyle(
                result.infection_analysis.risk_level
              )}`}
            >
              {result.infection_analysis.risk_level}
            </span>
          </div>
          <ul className="space-y-1">
            {result.infection_analysis.signs.map((sign, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200 flex items-start gap-2"
              >
                <span className="text-gray-500">•</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Treatment Recommendations */}
      {result.treatment_recommendations && (
        <TreatmentSteps recommendations={result.treatment_recommendations} />
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
        <button
          onClick={onExport}
          className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          aria-label="Export analysis report"
        >
          <span>📄</span>
          <span>Export Report</span>
        </button>

        <button
          onClick={onPrint}
          className="py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
          aria-label="Print analysis"
        >
          <span>🖨️</span>
          <span>Print</span>
        </button>

        <button
          onClick={onReset}
          className="md:col-span-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          aria-label="Analyze another wound"
        >
          Analyze Another Wound
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
