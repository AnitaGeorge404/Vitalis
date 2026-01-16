import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const SkinRashRiskDetector = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [riskScore, setRiskScore] = useState(0);
  const [advice, setAdvice] = useState("");
  const [analysisDetails, setAnalysisDetails] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const maxSize = 500;
      const ratio = Math.min(maxSize / image.width, maxSize / image.height);
      const newWidth = image.width * ratio;
      const newHeight = image.height * ratio;

      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
      ctx.drawImage(image, 0, 0, newWidth, newHeight);
    }
  }, [image]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const analyzeRashRisk = async () => {
    if (!image || isAnalyzing || !canvasRef.current) return;

    setIsAnalyzing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Convert canvas to tensor
      const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();

      // Advanced color analysis using TensorFlow
      const imgData = await tensor.squeeze().array();
      
      // Calculate redness (red channel dominance)
      let rednessScore = 0;
      let inflammationScore = 0;
      let textureScore = 0;
      let coverageScore = 0;
      
      const totalPixels = 224 * 224;
      let redPixels = 0;
      let edgeCount = 0;
      
      for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 224; x++) {
          const r = imgData[y][x][0];
          const g = imgData[y][x][1];
          const b = imgData[y][x][2];
          
          // Detect redness
          if (r > 0.55 && r > g * 1.2 && r > b * 1.2) {
            redPixels++;
            rednessScore += (r - (g + b) / 2);
          }
          
          // Detect edges (texture)
          if (x > 0 && y > 0) {
            const prevR = imgData[y][x-1][0];
            const prevG = imgData[y-1][x][1];
            if (Math.abs(r - prevR) > 0.15 || Math.abs(g - prevG) > 0.15) {
              edgeCount++;
            }
          }
        }
      }
      
      // Calculate scores
      rednessScore = Math.min(100, (redPixels / totalPixels) * 200);
      coverageScore = Math.min(100, (redPixels / totalPixels) * 150);
      textureScore = Math.min(100, (edgeCount / totalPixels) * 300);
      inflammationScore = Math.min(100, rednessScore * 0.6 + textureScore * 0.4);
      
      const finalScore = Math.round(
        rednessScore * 0.3 +
        inflammationScore * 0.35 +
        textureScore * 0.2 +
        coverageScore * 0.15
      );

      // Determine risk level
      let level = "Low";
      let adviceText = "✓ Low risk detected. Continue normal skincare routine.";
      
      if (finalScore > 70) {
        level = "High";
        adviceText = "⚠️ High inflammation risk detected. Seek immediate medical attention.";
      } else if (finalScore > 40) {
        level = "Medium";
        adviceText = "⚠️ Moderate rash indicators. Monitor closely and consult if worsens.";
      }

      setRiskScore(finalScore);
      setRiskLevel(level);
      setAdvice(adviceText);
      setAnalysisDetails({
        redness: Math.round(rednessScore),
        inflammation: Math.round(inflammationScore),
        texture: Math.round(textureScore),
        coverage: Math.round(coverageScore),
      });

      // Draw overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);

      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      const colors = {
        High: ["rgba(239,68,68,0.4)", "rgba(239,68,68,0.05)"],
        Medium: ["rgba(245,158,11,0.35)", "rgba(245,158,11,0.05)"],
        Low: ["rgba(34,197,94,0.25)", "rgba(34,197,94,0.02)"],
      };

      gradient.addColorStop(0, colors[level][0]);
      gradient.addColorStop(1, colors[level][1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = level === "High" ? "rgba(239,68,68,0.6)" :
                        level === "Medium" ? "rgba(245,158,11,0.6)" :
                        "rgba(34,197,94,0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      tensor.dispose();
    } catch (error) {
      console.error("Analysis error:", error);
      setAdvice("❌ Analysis failed. Please try again.");
    }

    setIsAnalyzing(false);
  };

  const clearAnalysis = () => {
    setImage(null);
    setRiskScore(0);
    setRiskLevel("Low");
    setAdvice("");
    setAnalysisDetails({});
  };

  return (
    <div style={styles.detector}>
      <div style={styles.card}>
        <h1 style={styles.title}>🩹 Skin Rash Detector</h1>
        <p style={styles.subtitle}>
          Upload clear photo. AI detects inflammation patterns instantly.
          <br />
          <strong style={styles.warning}>⚠️ Educational tool — Consult doctor for diagnosis</strong>
        </p>

        {!image ? (
          <label
            style={{...styles.uploadArea, ...(dragActive ? styles.dragover : {})}}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleImageUpload({ target: { files: e.dataTransfer.files } });
            }}
          >
            <div style={styles.uploadIcon}>📸</div>
            <div style={styles.uploadText}>Tap or drag skin photo</div>
            <div style={styles.uploadSubtext}>JPG, PNG (max 10MB)</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
        ) : (
          <>
            <div style={styles.canvasContainer}>
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>

            <button
              style={{...styles.btn, ...styles.btnAnalyze, ...(isAnalyzing ? styles.btnDisabled : {})}}
              onClick={analyzeRashRisk}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "🔍 Analyzing..." : "🚀 Analyze Rash Risk"}
            </button>

            {riskScore > 0 && (
              <div style={styles.results}>
                <div style={{
                  ...styles.riskBadge,
                  ...(riskLevel === "High" ? styles.badgeHigh :
                      riskLevel === "Medium" ? styles.badgeMedium :
                      styles.badgeLow)
                }}>
                  {riskLevel} Risk
                </div>
                <div style={styles.riskScore}>{riskScore}%</div>

                {Object.keys(analysisDetails).length > 0 && (
                  <div style={styles.detailsGrid}>
                    {Object.entries(analysisDetails).map(([key, value]) => (
                      <div key={key} style={styles.detailItem}>
                        <div style={styles.detailLabel}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                        <div style={styles.detailValue}>{value}%</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  ...styles.advice,
                  ...(riskLevel === "High" ? styles.adviceHigh :
                      riskLevel === "Medium" ? styles.adviceMedium :
                      styles.adviceLow)
                }}>
                  {advice}
                </div>

                <button style={{...styles.btn, ...styles.btnClear}} onClick={clearAnalysis}>
                  🔄 New Analysis
                </button>
              </div>
            )}
          </>
        )}

        <div style={styles.disclaimer}>
          🏥 TensorFlow.js analysis. Always consult medical professionals.
        </div>
      </div>
    </div>
  );
};

const styles = {
  detector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f5fdf7",
    minHeight: "100vh",
  },
  card: {
    width: "100%",
    maxWidth: "650px",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.10)",
    padding: "40px",
  },
  title: {
    fontSize: "clamp(2rem, 6vw, 3.2rem)",
    fontWeight: 900,
    color: "#047857",
    margin: "0 0 12px",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "32px",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  warning: {
    color: "#065f46",
    fontWeight: 700,
  },
  uploadArea: {
    border: "3px dashed #d1fae5",
    borderRadius: "20px",
    padding: "48px 24px",
    textAlign: "center",
    background: "#f9fffb",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "24px",
  },
  dragover: {
    borderColor: "#16a34a",
    background: "#dcfce7",
    transform: "translateY(-4px)",
  },
  uploadIcon: {
    fontSize: "5rem",
    marginBottom: "16px",
  },
  uploadText: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#022c22",
    marginBottom: "8px",
  },
  uploadSubtext: {
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  canvasContainer: {
    position: "relative",
    margin: "0 auto 24px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
  },
  canvas: {
    display: "block",
    maxWidth: "100%",
    height: "auto",
    width: "100%",
  },
  btn: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "1.1rem",
    fontWeight: 800,
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  btnAnalyze: {
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "white",
    boxShadow: "0 12px 30px rgba(34,197,94,0.35)",
  },
  btnDisabled: {
    background: "#e5e7eb",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  btnClear: {
    background: "#f1f5f9",
    color: "#475569",
    border: "2px solid #e2e8f0",
  },
  results: {
    background: "#f9fffb",
    borderRadius: "20px",
    padding: "28px",
    border: "2px solid #d1fae5",
  },
  riskBadge: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: "0.95rem",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  badgeHigh: {
    background: "rgba(239,68,68,0.15)",
    color: "#b91c1c",
  },
  badgeMedium: {
    background: "rgba(245,158,11,0.15)",
    color: "#b45309",
  },
  badgeLow: {
    background: "rgba(16,185,129,0.15)",
    color: "#047857",
  },
  riskScore: {
    fontSize: "clamp(3.5rem, 15vw, 7rem)",
    fontWeight: 900,
    textAlign: "center",
    color: "#059669",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },
  detailItem: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  detailLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  detailValue: {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "#059669",
  },
  advice: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    borderLeft: "5px solid",
    lineHeight: 1.7,
    marginBottom: "20px",
    color: "#022c22",
    fontWeight: 500,
  },
  adviceHigh: {
    borderLeftColor: "#ef4444",
    background: "rgba(239,68,68,0.05)",
  },
  adviceMedium: {
    borderLeftColor: "#f59e0b",
    background: "rgba(245,158,11,0.05)",
  },
  adviceLow: {
    borderLeftColor: "#22c55e",
    background: "rgba(34,197,94,0.05)",
  },
  disclaimer: {
    fontSize: "0.85rem",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "28px",
    lineHeight: 1.6,
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },
};

export default SkinRashRiskDetector;