import { useState } from "react";
import "./App.css";

export default function App() {
  const [scene, setScene] = useState("");
  const [pdf, setPdf] = useState(null);
  const [mode, setMode] = useState("text"); // text | pdf
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  /* ---------------- TEXT ANALYSIS ---------------- */
  const analyzeText = async () => {
    if (!scene.trim()) return;

    setLoading(true);
    setResult(null);
    setImageUrl(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_text: scene }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Backend error");
    }

    setLoading(false);
  };

  /* ---------------- PDF ANALYSIS ---------------- */
  const analyzePDF = async () => {
    if (!pdf) return;

    setLoading(true);
    setResult(null);
    setImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", pdf);

      const res = await fetch("http://127.0.0.1:8000/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("PDF analysis failed");
    }

    setLoading(false);
  };

  const analyze = () => {
    if (mode === "text") analyzeText();
    else analyzePDF();
  };

  /* ---------------- IMAGE GENERATION ---------------- */
  const generateImage = async () => {
    if (!scene.trim()) return;

    setImageLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_text: scene }),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      alert("Image generation failed");
    }

    setImageLoading(false);
  };

  const riskColor =
    result?.risk_level === "High"
      ? "#ef4444"
      : result?.risk_level === "Medium"
      ? "#f59e0b"
      : "#22c55e";

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎬 AI Scene Feasibility & Risk Predictor</h1>

      {/* MODE TOGGLE */}
      <div style={{ marginBottom: 20 }}>
        <button
          style={mode === "text" ? activeTab : tab}
          onClick={() => setMode("text")}
        >
          Text Scene
        </button>
        <button
          style={mode === "pdf" ? activeTab : tab}
          onClick={() => setMode("pdf")}
        >
          Upload Script PDF
        </button>
      </div>

      {/* INPUTS */}
      {mode === "text" && (
        <textarea
          rows={5}
          style={textareaStyle}
          placeholder="Describe the scene..."
          value={scene}
          onChange={(e) => setScene(e.target.value)}
        />
      )}

      {mode === "pdf" && (
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0])}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: 20 }}>
        <button style={buttonStyle} onClick={analyze}>
          Analyze
        </button>

        {mode === "text" && (
          <button
            style={{ ...buttonStyle, marginLeft: 10 }}
            onClick={generateImage}
          >
            Generate Image
          </button>
        )}
      </div>

      {loading && <p>🔍 Analyzing scene...</p>}

      {imageLoading && (
        <p style={{ marginTop: 10 }}>
          🎨 Generating scene preview with actor & camera safety...
        </p>
      )}

      {/* RESULTS */}
      {result && (
        <>
          <div style={badgeRow}>
            <span>Risk Level:</span>
            <span style={{ ...badgeStyle, background: riskColor }}>
              {result.risk_level}
            </span>
          </div>

          <p>
            <strong>Feasibility:</strong> {result.feasibility}
          </p>

          <div style={cardStyle}>
            <h3>Risk Factors</h3>
            <ul>
              {result.risk_factors.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={cardStyle}>
            <h3>Role-Based Risk Prediction</h3>
            {Object.entries(result.role_based_risks).map(([role, rules]) => (
              <div key={role}>
                <h4>{role.toUpperCase()}</h4>
                <ul>
                  {rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h3>Safety Instructions</h3>
            {Object.entries(result.safety_instructions).map(
              ([role, rules]) => (
                <div key={role}>
                  <h4>{role.toUpperCase()}</h4>
                  <ul>
                    {rules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>

          {/* MOTION MODELING */}
          {result.motion_paths && (
            <div style={cardStyle}>
              <h3>Motion Modeling</h3>

              <p><strong>Actor Path:</strong></p>
              <ul>
                {result.motion_paths.actor_path.map((p, i) => (
                  <li key={i}>Step {i + 1}: X={p[0]}, Y={p[1]}</li>
                ))}
              </ul>

              <p><strong>Camera Path:</strong></p>
              <ul>
                {result.motion_paths.camera_path.map((p, i) => (
                  <li key={i}>Step {i + 1}: X={p[0]}, Y={p[1]}</li>
                ))}
              </ul>
            </div>
          )}

          {/* COLLISION DETECTION */}
          {result.collision_report && (
            <div style={cardStyle}>
              <h3>Collision Detection</h3>

              {result.collision_report.collision_detected ? (
                <>
                  <p style={{ color: "#ef4444", fontWeight: "bold" }}>
                    Potential safety conflicts detected
                  </p>
                  <ul>
                    {result.collision_report.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                  No collision risks detected
                </p>
              )}
            </div>
          )}
        </>
      )}
    {result?.motion_paths && result?.collision_report && (
      <MotionVisualization
        motion={result.motion_paths}
        collision={result.collision_report}
      />
    )}

      {/* IMAGE PREVIEW */}
      {imageUrl && (
        <div style={cardStyle}>
          <h3>Scene Preview</h3>
          <img
            src={imageUrl}
            alt="Scene Preview"
            style={{ width: "100%", borderRadius: 10 }}
          />
        </div>
      )}
    </div>
  );
}
function MotionVisualization({ motion, collision }) {
  const scale = 60;
  const offset = 150;

  const toSVGPoint = ([x, y]) => ({
    x: offset + x * scale,
    y: offset + y * scale,
  });

  const actorPoints = motion.actor_path.map(toSVGPoint);
  const cameraPoints = motion.camera_path.map(toSVGPoint);

  const buildPath = (points) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={cardStyle}>
      <h3>🧭 Motion Modeling (Top-Down View)</h3>

      <svg
        width="300"
        height="300"
        style={{ background: "#020617", borderRadius: 10 }}
      >
        {/* Actor Path */}
        <path
          d={buildPath(actorPoints)}
          stroke="#38bdf8"
          strokeWidth="3"
          fill="none"
        />
        {actorPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#38bdf8" />
        ))}

        {/* Camera Path */}
        <path
          d={buildPath(cameraPoints)}
          stroke="#fb923c"
          strokeWidth="3"
          fill="none"
        />
        {cameraPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fb923c" />
        ))}

        {/* Collision */}
        {collision?.collision_detected &&
          (collision.collision_points || []).map((pt, i) => {
            const p = toSVGPoint(pt);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="8"
                fill="red"
                opacity="0.8"
              />
            );
          })}
      </svg>

      <p style={{ marginTop: 10, color: "#94a3b8" }}>
        🔵 Actor &nbsp; 🟠 Camera &nbsp; 🔴 Collision
      </p>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const containerStyle = {
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
  padding: 40,
  color: "white",
  fontFamily: "Segoe UI",
  textAlign: "center",
};

const titleStyle = { marginBottom: 30 };

const textareaStyle = {
  width: "100%",
  maxWidth: "900px",
  padding: 18,
  borderRadius: 10,
  background: "#1f2937",
  color: "white",
  border: "1px solid #374151",
  fontSize: 16,
  marginBottom: 15,
};

const buttonStyle = {
  padding: "12px 24px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};

const tab = {
  padding: "10px 18px",
  marginRight: 10,
  borderRadius: 6,
  border: "1px solid #374151",
  background: "#1f2937",
  color: "white",
};

const activeTab = { ...tab, background: "#2563eb" };

const badgeRow = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  fontSize: 18,
};

const badgeStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  fontWeight: "bold",
};

const cardStyle = {
  background: "#1f2937",
  padding: 24,
  borderRadius: 12,
  marginTop: 20,
  border: "1px solid #374151",
  textAlign: "left",
};
