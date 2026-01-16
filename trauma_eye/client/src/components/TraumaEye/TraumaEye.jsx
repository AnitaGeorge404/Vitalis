import React, { useState, useEffect } from "react";
import CameraCapture from "./CameraCapture";
import ResultsDisplay from "./ResultsDisplay";
import WoundHistory from "./WoundHistory";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const STORAGE_KEY = "traumaEye_woundHistory";

const TraumaEye = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [woundHistory, setWoundHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load wound history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWoundHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load wound history:", err);
    }
  }, []);

  // Save wound history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(woundHistory));
    } catch (err) {
      console.error("Failed to save wound history:", err);
    }
  }, [woundHistory]);

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setAnalysisResult(null);
    setError(null);
  };

  const analyzeWound = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Get the most recent wound data for comparison (if exists)
      const previousWoundData =
        woundHistory.length > 0 ? woundHistory[0].analysisResult : undefined;

      const response = await fetch(`${API_URL}/api/analyze-wound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: capturedImage,
          previous_wound_data: previousWoundData,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.message);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(result);

        // Add to history if wound was detected
        if (result.risk !== "NONE" && result.risk !== "UNKNOWN") {
          const historyItem = {
            id: Date.now().toString(),
            timestamp: result.timestamp,
            analysisResult: result,
            thumbnail: capturedImage,
          };

          setWoundHistory((prev) => [historyItem, ...prev].slice(0, 20)); // Keep last 20
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.message ||
          "Failed to analyze wound. Please check your connection and try again."
      );
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleEmergencyCall = () => {
    // On mobile, this will trigger the phone dialer
    window.location.href = "tel:911";
  };

  const handleExportReport = () => {
    if (!analysisResult) return;

    const report = generateTextReport(analysisResult);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wound-analysis-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all wound history?")) {
      setWoundHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏥 Trauma Eye
          </h1>
          <p className="text-lg text-gray-600">
            Emergency Wound Analysis System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            AI-powered wound detection and treatment recommendations
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {!capturedImage && !analysisResult && (
            <>
              <CameraCapture onCapture={handleImageCapture} />

              {woundHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="mt-6 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {showHistory ? "Hide" : "View"} Wound History (
                  {woundHistory.length})
                </button>
              )}
            </>
          )}

          {capturedImage && !analysisResult && !isAnalyzing && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Review Image
              </h2>
              <img
                src={capturedImage}
                alt="Captured wound"
                className="w-full rounded-lg shadow-md mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={analyzeWound}
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
                >
                  Analyze Wound
                </button>
                <button
                  onClick={handleRetake}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Analyzing Wound...
              </h2>
              <p className="text-gray-600">
                Processing image and detecting wound characteristics
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take 2-5 seconds
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">
                    Analysis Error
                  </h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <ResultsDisplay
              result={analysisResult}
              onReset={handleReset}
              onEmergencyCall={handleEmergencyCall}
              onExport={handleExportReport}
              onPrint={handlePrint}
            />
          )}
        </div>

        {/* Wound History */}
        {showHistory && woundHistory.length > 0 && (
          <WoundHistory
            history={woundHistory}
            onClose={() => setShowHistory(false)}
            onClear={clearHistory}
          />
        )}

        {/* Footer Disclaimer */}
        <footer className="text-center text-sm text-gray-500 mt-8 px-4">
          <p className="mb-2">
            ⚠️ <strong>Medical Disclaimer:</strong> This tool provides
            preliminary wound assessment only.
          </p>
          <p>
            Always seek professional medical advice for any injury. In case of
            emergency, call 911 immediately.
          </p>
        </footer>
      </div>
    </div>
  );
};

// Helper function to generate text report
function generateTextReport(result) {
  let report = "=== TRAUMA EYE - WOUND ANALYSIS REPORT ===\n\n";
  report += `Date: ${new Date(result.timestamp).toLocaleString()}\n\n`;
  report += `RISK LEVEL: ${result.risk}\n`;
  report += `Confidence: ${(result.confidence * 100).toFixed(1)}%\n\n`;
  report += `Assessment: ${result.message}\n\n`;

  if (result.wound_types && result.wound_types.length > 0) {
    report += "--- WOUND TYPE ---\n";
    result.wound_types.forEach((type) => {
      report += `• ${type}\n`;
    });
    report += "\n";
  }

  if (result.measurements) {
    report += "--- MEASUREMENTS ---\n";
    report += `Size: ${result.measurements.estimated_cm}\n`;
    report += `Category: ${result.measurements.size_category}\n`;
    report += `Area: ${result.measurements.area_pixels} pixels\n\n`;
  }

  if (result.infection_analysis) {
    report += "--- INFECTION RISK ---\n";
    report += `Risk Level: ${result.infection_analysis.risk_level}\n`;
    result.infection_analysis.signs.forEach((sign) => {
      report += `• ${sign}\n`;
    });
    report += "\n";
  }

  if (result.treatment_recommendations) {
    report += "--- TREATMENT RECOMMENDATIONS ---\n";
    report += `Urgency: ${result.treatment_recommendations.urgency}\n\n`;
    report += "Steps:\n";
    result.treatment_recommendations.steps.forEach((step, i) => {
      report += `${i + 1}. ${step}\n`;
    });
    report += "\n";
    report += "Seek Emergency Care If:\n";
    result.treatment_recommendations.seek_emergency_if.forEach((sign) => {
      report += `• ${sign}\n`;
    });
    report += "\n";
  }

  if (result.wound_comparison) {
    report += "--- WOUND COMPARISON ---\n";
    report += `Status: ${result.wound_comparison.healing_status}\n`;
    report += `${result.wound_comparison.comparison}\n\n`;
  }

  report += "=== END OF REPORT ===\n";
  report += "\nDISCLAIMER: This analysis is for informational purposes only.\n";
  report += "Always consult a healthcare professional for medical advice.\n";

  return report;
}

export default TraumaEye;
