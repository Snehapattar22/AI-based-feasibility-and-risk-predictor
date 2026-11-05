import { useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const sampleScene = `A stunt actor runs across a warehouse floor carrying a prop light while a handheld camera operator follows closely. The scene includes a technician near a hazard zone with cables across the floor and a narrow entrance path beside a loading bay.`;

const featureCards = [
  {
    icon: "🔎",
    title: "Scene intelligence",
    description: "Analyze scripts and scene text to classify safety risk, feasibility, and crew exposure in real time.",
  },
  {
    icon: "🧭",
    title: "Motion safety",
    description: "Map actor and camera lanes, detect conflict zones, and flag risky movement patterns before shooting.",
  },
  {
    icon: "🛡️",
    title: "Crew guidance",
    description: "Translate policy into role-specific instructions for actors, camera teams, technicians, and directors.",
  },
];

const architectureLayers = [
  { title: "Input layer", text: "Scene text, PDF scripts, and production notes enter the system as structured requests." },
  { title: "AI analysis", text: "Groq-powered reasoning identifies risk factors, role exposures, and compliance guidance." },
  { title: "Decision engine", text: "Feasibility, motion, and collision checks convert insights into production recommendations." },
  { title: "Output layer", text: "Reports, visuals, and safety briefs are surfaced in a dashboard and preview experience." },
];

export default function App() {
  const [scene, setScene] = useState(sampleScene);
  const [pdfFile, setPdfFile] = useState(null);
  const [mode, setMode] = useState("text");
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");

  const insightCards = useMemo(() => {
    if (!result) {
      return [
        { label: "Risk level", value: "Pending", tone: "neutral" },
        { label: "Feasibility", value: "Awaiting review", tone: "neutral" },
        { label: "Collision risk", value: "Not checked", tone: "neutral" },
        { label: "Crew guidance", value: "Drafting", tone: "neutral" },
      ];
    }

    const riskTone =
      result.risk_level === "High"
        ? "danger"
        : result.risk_level === "Medium"
          ? "warning"
          : "success";

    return [
      { label: "Risk level", value: result.risk_level || "Medium", tone: riskTone },
      { label: "Feasibility", value: result.feasibility || "Approved with Conditions", tone: "info" },
      { label: "Collision risk", value: result.collision_report?.collision_detected ? "Detected" : "Clear", tone: result.collision_report?.collision_detected ? "danger" : "success" },
      { label: "Role actions", value: `${Object.keys(result.role_based_risks || {}).length} squads`, tone: "neutral" },
    ];
  }, [result]);

  const analyzeText = async () => {
    if (!scene.trim()) {
      setError("Enter a scene description or upload a script before running analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setImageUrl("");

    try {
      const response = await fetch(`${API_BASE}/analyze-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_text: scene }),
      });

      if (!response.ok) {
        throw new Error("Scene analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("The scene analysis service is unavailable. Confirm the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const analyzePDF = async () => {
    if (!pdfFile) {
      setError("Select a PDF script before running the file analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setImageUrl("");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch(`${API_BASE}/analyze-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("PDF analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("The PDF analysis service is unavailable. Check the file and backend state.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (mode === "text") analyzeText();
    else analyzePDF();
  };

  const generateImage = async () => {
    if (!scene.trim()) {
      setError("Add a detailed scene description before generating the preview.");
      return;
    }

    setImageLoading(true);
    setImageUrl("");
    setError("");

    try {
      const response = await fetch(`${API_BASE}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_text: scene }),
      });

      if (!response.ok) {
        throw new Error("Image generation failed");
      }

      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError("Preview generation failed. The image service may be unavailable.");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar panel">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AstraVision</div>
            <div className="brand-tag">Production safety intelligence</div>
          </div>
        </div>

        <nav className="nav">
          <a href="#overview">Overview</a>
          <a href="#workspace">Workspace</a>
          <a href="#architecture">Architecture</a>
          <a href="#insights">Insights</a>
        </nav>

        <button className="primary-btn">Launch risk review</button>
      </header>

      <main className="main-content">
        <section className="hero panel" id="overview">
          <div className="hero-copy">
            <span className="eyebrow">AI scene feasibility platform</span>
            <h1>Turn script risk into production clarity before the first take.</h1>
            <p>
              Evaluate scene safety, actor exposure, camera workflow conflicts, and crew readiness from a single dashboard built for fast decision-making.
            </p>

            <div className="cta-row">
              <button className="primary-btn" onClick={() => setMode("text")}>Run scene analysis</button>
              <button className="secondary-btn" onClick={() => setMode("pdf")}>Upload script PDF</button>
            </div>
          </div>

          <div className="hero-metrics">
            {insightCards.map((item) => (
              <div key={item.label} className={`metric-card ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="panel feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="architecture-section" id="architecture">
          <div className="section-header">
            <span className="section-kicker">System architecture</span>
            <h2>Four connected layers power every safety decision.</h2>
          </div>

          <div className="architecture-grid">
            {architectureLayers.map((layer, index) => (
              <div key={layer.title} className="panel architecture-card">
                <div className="step-index">0{index + 1}</div>
                <h3>{layer.title}</h3>
                <p>{layer.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="workspace" id="workspace">
          <div className="panel analyzer-panel">
            <div className="section-header compact">
              <span className="section-kicker">Scene workspace</span>
              <h2>Production risk review</h2>
            </div>

            <div className="mode-toggle">
              <button className={mode === "text" ? "tab active" : "tab"} onClick={() => setMode("text")}>Text scene</button>
              <button className={mode === "pdf" ? "tab active" : "tab"} onClick={() => setMode("pdf")}>Script PDF</button>
            </div>

            {mode === "text" ? (
              <textarea
                className="text-input"
                value={scene}
                onChange={(event) => setScene(event.target.value)}
                placeholder="Describe the production environment, actor movement, hazards, and crew layout..."
              />
            ) : (
              <div className="upload-box">
                <label htmlFor="pdf-upload">Upload production script</label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                />
                <span>{pdfFile ? pdfFile.name : "No file selected"}</span>
              </div>
            )}

            <div className="action-row">
              <button className="primary-btn" onClick={handleAnalyze} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze scene"}
              </button>
              {mode === "text" && (
                <button className="secondary-btn" onClick={generateImage} disabled={imageLoading}>
                  {imageLoading ? "Generating..." : "Generate preview"}
                </button>
              )}
            </div>

            {error && <div className="alert error">{error}</div>}
          </div>

          <aside className="panel summary-panel" id="insights">
            <div className="section-header compact">
              <span className="section-kicker">Live summary</span>
              <h2>Decision snapshot</h2>
            </div>

            {result ? (
              <>
                <div className={`risk-badge ${result.risk_level?.toLowerCase() || "medium"}`}>
                  {result.risk_level || "Medium"}
                </div>
                <div className="summary-row">
                  <span>Feasibility</span>
                  <strong>{result.feasibility || "Approved with Conditions"}</strong>
                </div>
                <div className="summary-row">
                  <span>Collision detection</span>
                  <strong>{result.collision_report?.collision_detected ? "Alert" : "Clear"}</strong>
                </div>
                <div className="summary-list">
                  <h3>Top risk factors</h3>
                  <ul>
                    {(result.risk_factors || []).map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Run a risk assessment to populate the decision snapshot.</p>
              </div>
            )}
          </aside>
        </section>

        {result && (
          <section className="results-grid">
            <article className="panel result-card">
              <h3>Risk factors</h3>
              <ul>
                {(result.risk_factors || []).map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="panel result-card">
              <h3>Role-based risks</h3>
              {Object.entries(result.role_based_risks || {}).map(([role, items]) => (
                <div key={role} className="role-block">
                  <strong>{role}</strong>
                  <ul>
                    {(items || []).map((item, index) => (
                      <li key={`${role}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>

            <article className="panel result-card">
              <h3>Safety instructions</h3>
              {Object.entries(result.safety_instructions || {}).map(([role, items]) => (
                <div key={role} className="role-block">
                  <strong>{role}</strong>
                  <ul>
                    {(items || []).map((item, index) => (
                      <li key={`${role}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>

            <article className="panel result-card">
              <h3>Motion modeling</h3>
              <div className="path-list">
                <div>
                  <span>Actor path</span>
                  <ul>
                    {((result.motion_paths && result.motion_paths.actor_path) || []).map((point, index) => (
                      <li key={`actor-${index}`}>Step {index + 1}: ({point[0]}, {point[1]})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>Camera path</span>
                  <ul>
                    {((result.motion_paths && result.motion_paths.camera_path) || []).map((point, index) => (
                      <li key={`camera-${index}`}>Step {index + 1}: ({point[0]}, {point[1]})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className="panel result-card">
              <h3>Collision report</h3>
              {result.collision_report?.collision_detected ? (
                <>
                  <p className="danger-copy">Potential safety conflicts detected.</p>
                  <ul>
                    {(result.collision_report.issues || []).map((issue, index) => (
                      <li key={`${issue}-${index}`}>{issue}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="success-copy">No collision risks were flagged for this scene.</p>
              )}
            </article>
          </section>
        )}

        {imageUrl && (
          <section className="panel image-panel">
            <div className="section-header compact">
              <span className="section-kicker">Visual preview</span>
              <h2>Scene concept image</h2>
            </div>
            <img src={imageUrl} alt="Generated scene preview" className="preview-image" />
          </section>
        )}
      </main>
    </div>
  );
}

