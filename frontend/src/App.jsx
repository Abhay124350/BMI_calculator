import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const BMI_ZONES = [
  { label: "Underweight", range: "< 18.5", color: "#60CFFF", max: 18.5 },
  { label: "Normal", range: "18.5 – 24.9", color: "#4ADE80", max: 24.9 },
  { label: "Overweight", range: "25 – 29.9", color: "#FACC15", max: 29.9 },
  { label: "Obese", range: "> 30", color: "#F87171", max: 50 },
];

const getZone = (bmi) => {
  if (bmi < 18.5) return BMI_ZONES[0];
  if (bmi < 25) return BMI_ZONES[1];
  if (bmi < 30) return BMI_ZONES[2];
  return BMI_ZONES[3];
};

// Maps BMI (10–45) to needle angle (–135deg to +135deg)
const bmiToAngle = (bmi) => {
  const clamped = Math.min(Math.max(bmi, 10), 45);
  return ((clamped - 10) / 35) * 270 - 135;
};

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef();

  useEffect(() => {
    const target = parseFloat(value);
    const start = performance.now();
    const duration = 900;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay((target * eased).toFixed(1));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setDisplay(target.toFixed(1));
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <span>{display}</span>;
};

const App = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [zone, setZone] = useState(null);
  const [angle, setAngle] = useState(-135);
  const [revealed, setRevealed] = useState(false);

  const calculateBMI = () => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      alert("Please enter valid values");
      return;
    }
    const h = height / 100;
    const val = parseFloat((weight / (h * h)).toFixed(1));
    setBmi(val);
    setZone(getZone(val));
    setRevealed(false);
    setTimeout(() => {
      setAngle(bmiToAngle(val));
      setRevealed(true);
    }, 50);
  };

  const reset = () => {
    setHeight("");
    setWeight("");
    setBmi(null);
    setZone(null);
    setAngle(-135);
    setRevealed(false);
  };

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <span className="badge">Health Tool</span>
          <h1 className="title">BMI Calculator</h1>
          <p className="subtitle">Body Mass Index Analyzer</p>
        </div>

        {/* Gauge */}
        <div className="gauge-wrapper">
          <svg viewBox="0 0 220 130" className="gauge-svg">
            {/* Arc segments */}
            <path d="M 20 110 A 90 90 0 0 1 65 27" stroke="#60CFFF" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 68 24 A 90 90 0 0 1 152 24" stroke="#4ADE80" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M 155 27 A 90 90 0 0 1 200 110" stroke="#FACC15" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Obese small extra tick */}
            <path d="M 200 110 A 90 90 0 0 1 200 111" stroke="#F87171" strokeWidth="14" fill="none" strokeLinecap="round" />

            {/* Tick marks */}
            {[...Array(7)].map((_, i) => {
              const a = (-135 + i * 45) * (Math.PI / 180);
              const x1 = 110 + 78 * Math.cos(a);
              const y1 = 110 + 78 * Math.sin(a);
              const x2 = 110 + 68 * Math.cos(a);
              const y2 = 110 + 68 * Math.sin(a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />;
            })}

            {/* Needle */}
            <g transform={`rotate(${angle}, 110, 110)`} style={{ transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <line x1="110" y1="110" x2="110" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="110" cy="110" r="7" fill="white" />
              <circle cx="110" cy="110" r="3.5" fill={zone?.color || "#555"} />
            </g>
          </svg>

          {/* BMI value in center */}
          <div className="gauge-center">
            {bmi ? (
              <>
                <div className="gauge-value" style={{ color: zone?.color }}>
                  <AnimatedNumber value={bmi} />
                </div>
                <div className="gauge-label">BMI</div>
              </>
            ) : (
              <div className="gauge-placeholder">–</div>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="inputs">
          <div className="input-group">
            <label>Height</label>
            <div className="input-wrap">
              <input
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span className="unit">cm</span>
            </div>
          </div>
          <div className="input-group">
            <label>Weight</label>
            <div className="input-wrap">
              <input
                type="number"
                placeholder="65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="unit">kg</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <button className="btn-calc" onClick={calculateBMI}>
            Calculate BMI
          </button>
          <button className="btn-reset" onClick={reset}>
            Reset
          </button>
        </div>

        {/* Result banner */}
        {bmi && zone && (
          <div className="result-banner" style={{ "--zone-color": zone.color }}>
            <div className="result-icon">
              {zone.label === "Normal" ? "✓" : zone.label === "Underweight" ? "↑" : zone.label === "Overweight" ? "↓" : "⚠"}
            </div>
            <div>
              <div className="result-status">{zone.label}</div>
              <div className="result-range">BMI range {zone.range}</div>
            </div>
          </div>
        )}

        {/* Zone bar legend */}
        <div className="legend">
          {BMI_ZONES.map((z) => (
            <div key={z.label} className={`legend-item ${zone?.label === z.label ? "active" : ""}`}>
              <div className="legend-dot" style={{ background: z.color }} />
              <div className="legend-text">
                <span className="legend-name">{z.label}</span>
                <span className="legend-range">{z.range}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;