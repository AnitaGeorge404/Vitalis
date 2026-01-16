import React, { useState } from "react";

const WoundHistory = ({ history, onClose, onClear }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const getRiskColor = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      case "MODERATE":
        return "text-yellow-700 bg-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today, " + date.toLocaleTimeString();
    } else if (diffDays === 1) {
      return "Yesterday, " + date.toLocaleTimeString();
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          <span>Wound History</span>
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close history"
        >
          ✕
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No wound history yet</p>
          <p className="text-sm mt-2">
            Analyzed wounds will appear here for comparison
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt="Wound"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                          item.analysisResult.risk
                        )}`}
                      >
                        {item.analysisResult.risk}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.analysisResult.message}
                    </p>

                    {item.analysisResult.wound_types &&
                      item.analysisResult.wound_types.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.analysisResult.wound_types[0]}
                        </p>
                      )}

                    {item.analysisResult.wound_comparison && (
                      <div className="mt-2 text-xs">
                        <span
                          className={`font-semibold ${
                            item.analysisResult.wound_comparison
                              .healing_status === "Improving"
                              ? "text-green-600"
                              : item.analysisResult.wound_comparison
                                  .healing_status === "Worsening"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {item.analysisResult.wound_comparison.healing_status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClear}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Clear All History
          </button>
        </>
      )}

      {/* Selected Item Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Analysis Details
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {new Date(selectedItem.timestamp).toLocaleString()}
              </p>

              {selectedItem.analysisResult.visual_overlay && (
                <img
                  src={selectedItem.analysisResult.visual_overlay}
                  alt="Analyzed wound"
                  className="w-full rounded-lg"
                />
              )}

              <div
                className={`p-4 rounded-lg ${getRiskColor(
                  selectedItem.analysisResult.risk
                )}`}
              >
                <p className="font-semibold">
                  {selectedItem.analysisResult.risk} RISK
                </p>
                <p className="text-sm mt-1">
                  {selectedItem.analysisResult.message}
                </p>
              </div>

              {selectedItem.analysisResult.wound_types && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Wound Type
                  </h4>
                  <ul className="space-y-1">
                    {selectedItem.analysisResult.wound_types.map(
                      (type, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2"
                        >
                          {type}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedItem.analysisResult.measurements && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Measurements
                  </h4>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p>
                      <strong>Size:</strong>{" "}
                      {selectedItem.analysisResult.measurements.estimated_cm}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {selectedItem.analysisResult.measurements.size_category}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.analysisResult.infection_analysis && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Infection Risk:{" "}
                    {selectedItem.analysisResult.infection_analysis.risk_level}
                  </h4>
                  <ul className="space-y-1">
                    {selectedItem.analysisResult.infection_analysis.signs.map(
                      (sign, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2"
                        >
                          {sign}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WoundHistory;
