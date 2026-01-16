"use client";

import React, { useEffect, useState } from "react";

/*
  Single-file enhanced AED Finder
  - All UI, data and styles contained in this file (per request)
  - Improved visual design, larger typography and responsive layout
  - Keeps the original logic and sample data
*/

/* ---------- sample resource data (unchanged) ---------- */
const AED_LOCATIONS = [
  { id: 1, type: "AED", name: "City Mall AED Station", lat: 9.613, lng: 76.522, notes: "Near main entrance" },
  { id: 2, type: "AED", name: "Central Metro AED", lat: 9.615, lng: 76.528, notes: "Platform level" },
  { id: 3, type: "AED", name: "Hospital Main Gate AED", lat: 9.618, lng: 76.525, notes: "Emergency gate" },
  { id: 4, type: "AED", name: "Community Centre AED", lat: 9.620, lng: 76.521, notes: "Reception desk" },
];

const HOSPITALS = [
  { id: 101, type: "HOSPITAL", name: "City Multispeciality Hospital (24×7 ER)", lat: 9.619, lng: 76.527, notes: "Emergency entrance at Gate 3" },
  { id: 102, type: "HOSPITAL", name: "St. Mary’s Trauma Centre", lat: 9.624, lng: 76.520, notes: "Trauma & neurology priority" },
  { id: 103, type: "HOSPITAL", name: "Govt. General Hospital", lat: 9.611, lng: 76.530, notes: "Public hospital, casualty ward" },
];

const PHARMACIES = [
  { id: 201, type: "PHARMACY", name: "24×7 Emergency Pharmacy", lat: 9.616, lng: 76.523, notes: "Open all night, emergency meds" },
  { id: 202, type: "PHARMACY", name: "City Medicals", lat: 9.617, lng: 76.529, notes: "Stock: epinephrine, inhalers, dressings" },
];

const POLICE_FIRE = [
  { id: 301, type: "POLICE", name: "Central Police Station", lat: 9.614, lng: 76.519, notes: "For crime, assault, missing persons" },
  { id: 302, type: "FIRE", name: "Fire & Rescue Station", lat: 9.622, lng: 76.533, notes: "Fire, building collapse, rescue" },
];

const SAFE_SPACES = [
  { id: 401, type: "SAFE", name: "Women’s Help Desk – City Mall", lat: 9.6135, lng: 76.5225, notes: "Ask security for help immediately" },
  { id: 402, type: "SAFE", name: "Community Help Centre", lat: 9.621, lng: 76.524, notes: "Staff trained in basic first aid" },
];

const VOLUNTEER_CLINICIANS = [
  {
    id: 501,
    type: "CLINICIAN",
    name: "Dr. Ananya Rao – Emergency Physician",
    lat: 9.6182,
    lng: 76.5261,
    notes: "8 yrs tertiary ER, Available now (voice/chat support only)",
  },
  {
    id: 502,
    type: "CLINICIAN",
    name: "Nurse Kiran Menon – Critical Care",
    lat: 9.6171,
    lng: 76.5238,
    notes: "6 yrs ICU & trauma, Online – may respond",
  },
  {
    id: 503,
    type: "CLINICIAN",
    name: "Dr. Arun Pillai – GP",
    lat: 9.6129,
    lng: 76.5294,
    notes: "10 yrs family medicine, Offline (typical evenings)",
  },
];

const RESOURCE_SETS = {
  AED: AED_LOCATIONS,
  HOSPITAL: HOSPITALS,
  PHARMACY: PHARMACIES,
  POLICE_FIRE: POLICE_FIRE,
  SAFE: SAFE_SPACES,
  CLINICIAN: VOLUNTEER_CLINICIANS,
};

/* ---------- utilities (unchanged) ---------- */
function getLocationOnce() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

function distance2D(aLat, aLng, bLat, bLng) {
  const dx = aLat - bLat;
  const dy = aLng - bLng;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ---------- component ---------- */
function AEDFinder() {
  const [location, setLocation] = useState(null);
  const [activeType, setActiveType] = useState("AED");
  const [sortedItems, setSortedItems] = useState(RESOURCE_SETS["AED"]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const fetchLocation = async () => {
    setLoading(true);
    setLocationError("");
    const loc = await getLocationOnce();
    setLocation(loc);
    setLoading(false);
    if (!loc) {
      setLocationError(
        "Location unavailable. Check GPS/browser permissions or select a resource manually."
      );
    }
  };

  useEffect(() => {
    const baseList = RESOURCE_SETS[activeType] || [];
    if (!location) {
      setSortedItems(baseList);
      return;
    }
    const sorted = [...baseList].sort((a, b) => {
      const da = distance2D(location.lat, location.lng, a.lat, a.lng);
      const db = distance2D(location.lat, location.lng, b.lat, b.lng);
      return da - db;
    });
    setSortedItems(sorted);
  }, [location, activeType]);

  /* ---------- inline style objects (kept for convenience) ---------- */
  const outer = {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: "1.25rem",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const inner = {
    width: "100%",
    maxWidth: "1320px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  };

  const pageHeader = { marginBottom: "0.25rem" };

  // kept small inline values where appropriate; most sizing is done in CSS below
  const headerBar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  };

  const locateButton = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const mapButton = {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    color: "#fff",
  };

  /* ---------- computed labels/icons (unchanged) ---------- */
  const resourceLabel =
    activeType === "AED"
      ? "defibrillator"
      : activeType === "HOSPITAL"
      ? "emergency hospital"
      : activeType === "PHARMACY"
      ? "emergency pharmacy"
      : activeType === "POLICE_FIRE"
      ? "police / fire station"
      : activeType === "SAFE"
      ? "safe help point"
      : "certified volunteer clinician";

  const activeIcon =
    activeType === "AED"
      ? "⚡"
      : activeType === "HOSPITAL"
      ? "🏥"
      : activeType === "PHARMACY"
      ? "💊"
      : activeType === "POLICE_FIRE"
      ? "🚓"
      : activeType === "SAFE"
      ? "🛟"
      : "👩‍⚕️";

  /* ---------- CSS injected into the page (single-file approach) ---------- */
  const css = `
    :root {
      --accent: #b91c1c;
      --accent-700: #dc2626;
      --muted: #6b7280;
      --card-bg: #fff;
      --soft: #fee2e2;
      --glass-border: rgba(252,165,165,0.32);
      --radius-lg: 18px;
      --radius-md: 12px;
    }

    /* global reset for this component */
    .aed-root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #111827; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }

    /* header */
    .aed-title {
      display:flex;
      align-items:center;
      gap:0.6rem;
      color:var(--accent);
      font-weight:900;
      margin:0;
      line-height:1;
      font-size: clamp(1.6rem, 5.6vw, 3.0rem); /* larger & responsive */
      text-shadow: 0 1px 0 rgba(255,255,255,0.6);
      letter-spacing: -0.02em;
    }

    .aed-subtitle {
      margin: 0.45rem 0 0;
      color: var(--muted);
      font-size: clamp(0.95rem, 2.2vw, 1.05rem);
      max-width: 880px;
      line-height: 1.35;
      opacity: 0.95;
    }

    .aed-card {
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      background: linear-gradient(180deg, #fff, #fff7f7);
      padding: 18px;
      display:flex;
      flex-direction:column;
      gap:14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
    }

    .aed-pill {
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--soft), #fecaca);
      border: 1px solid #f97373;
      color: var(--accent);
      font-weight:800;
      letter-spacing: 0.6px;
      display:inline-block;
    }

    /* locate button */
    .aed-locate {
      background: linear-gradient(135deg,#fff,#fee2e2);
      border:1px solid #fecaca;
      padding:8px 12px;
      border-radius:999px;
      font-weight:800;
      color:var(--accent-700);
      display:inline-flex;
      align-items:center;
      gap:8px;
      transition: transform .12s ease, box-shadow .12s ease;
      font-size: 0.98rem;
    }
    .aed-locate:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(220,38,38,0.12); }
    .aed-locate:disabled { opacity: 0.7; transform:none; box-shadow:none; cursor:default; }

    /* tabs */
    .aed-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
    .aed-tab {
      padding:10px 14px;
      border-radius:999px;
      border:1px solid #fecaca;
      background: #fff;
      color:var(--accent-700);
      font-weight:700;
      cursor:pointer;
      font-size: 0.98rem;
      transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
    }
    .aed-tab.active {
      background: linear-gradient(135deg,#fee2e2,#fecaca);
      border-color: #ef4444;
      box-shadow: 0 8px 20px rgba(239,68,68,0.10);
    }
    .aed-tab:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.06); }

    /* layout */
    .aed-layout {
      display: grid;
      grid-template-columns: 1.45fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .aed-mapbox {
      border-radius: var(--radius-md);
      border:1px solid #fecaca;
      padding:12px;
      background: linear-gradient(135deg,#fff8f8,#fff);
      min-height: 320px;
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .aed-minimap {
      border-radius: 12px;
      border:1px solid #fca5a5;
      height: clamp(220px, 28vw, 420px); /* bigger on wide screens */
      position:relative;
      overflow:hidden;
      background: radial-gradient(circle at 10% 10%, #fff8f7, #fff);
      box-shadow: 0 12px 30px rgba(185,28,28,0.06);
    }

    .aed-map-grid {
      position:absolute; inset:0;
      background-image: linear-gradient(#fecaca 1px, transparent 1px), linear-gradient(90deg, #fecaca 1px, transparent 1px);
      background-size: 28px 28px;
      opacity:0.28;
      pointer-events:none;
    }

    .aed-rad {
      position:absolute; inset:-40%;
      background: radial-gradient(circle at 50% 50%, rgba(248,113,113,0.22), transparent 55%);
      opacity: 0;
      transition: opacity .28s ease;
      pointer-events:none;
    }
    .aed-rad.active { opacity:1; }

    .aed-you {
      position:absolute;
      left:50%;
      top:58%;
      transform:translate(-50%,-50%);
      width:16px; height:16px;
      border-radius:999px;
      background: var(--accent-700);
      border: 3px solid #fff5f5;
      box-shadow: 0 0 0 8px rgba(220,38,38,0.12);
      z-index:3;
      animation: you-pulse 1800ms infinite;
    }

    @keyframes you-pulse {
      0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 6px rgba(220,38,38,0.14); }
      60% { transform: translate(-50%, -50%) scale(1.08); box-shadow: 0 0 0 22px rgba(220,38,38,0.06); }
      100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 6px rgba(220,38,38,0.14); }
    }

    .aed-you-label {
      position:absolute;
      top:58%;
      left:50%;
      transform: translate(-50%,-150%);
      font-size: 0.85rem;
      background:#fff6f6;
      border:1px solid #fecaca;
      color:var(--accent);
      padding:6px 8px;
      border-radius:999px;
      z-index:3;
      font-weight:700;
    }

    .aed-marker {
      position:absolute;
      border-radius:999px;
      padding:8px 10px;
      font-size:0.95rem;
      display:flex;
      align-items:center;
      gap:8px;
      cursor:pointer;
      transition: transform .12s ease, box-shadow .12s ease;
      white-space:nowrap;
      z-index:2;
    }
    .aed-marker.primary { background: linear-gradient(135deg,#b91c1c,#ef4444); color: #fff; box-shadow: 0 10px 30px rgba(239,68,68,0.22); }
    .aed-marker.secondary { background:#fff; border:1px solid #fecaca; color:var(--accent); box-shadow: 0 8px 24px rgba(185,28,28,0.06); }
    .aed-marker:hover { transform: translateY(-4px); }

    /* list column */
    .aed-listbox {
      border-radius: var(--radius-md);
      border:1px solid #fecaca;
      padding: 12px;
      min-height: 240px;
      background: linear-gradient(180deg,#fff,#fff7f7);
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .aed-list-header { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:1.02rem; font-weight:800; color:#111827; }
    .aed-list-sub { font-size:0.92rem; color:var(--muted); font-weight:600; }
    .aed-list-scroller { max-height: 360px; overflow-y:auto; padding-right:6px; display:flex; flex-direction:column; gap:10px; }

    .aed-item {
      border-radius:10px;
      padding:12px;
      background:#fff;
      border:1px solid #e5e7eb;
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:flex-start;
      transition: box-shadow .12s ease, transform .12s ease;
    }
    .aed-item.primary { background: #fff1f1; border-color:#f97373; box-shadow: 0 12px 24px rgba(239,68,68,0.06); }
    .aed-item:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(0,0,0,0.06); }

    .item-left { display:flex; flex-direction:column; gap:6px; }
    .item-title { font-size: clamp(1.03rem, 2.6vw, 1.18rem); font-weight:800; color:#111827; }
    .item-coords { color: var(--muted); font-size: 0.95rem; }
    .item-notes { color: var(--accent); font-weight:700; }

    .item-actions { display:flex; align-items:center; gap:8px; }

    .btn-map {
      background: linear-gradient(135deg,#dc2626,#b91c1c);
      color:#fff;
      padding:10px 14px;
      border-radius:999px;
      font-weight:800;
      border:none;
      cursor:pointer;
      transition: transform .12s ease, box-shadow .12s ease;
      box-shadow: 0 10px 26px rgba(185,28,28,0.14);
      font-size:0.95rem;
    }
    .btn-map:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(185,28,28,0.2); }

    /* small helpful note */
    .aed-note { font-size:0.92rem; color:var(--muted); text-align:right; }

    /* responsiveness */
    @media (max-width: 980px) {
      .aed-layout { grid-template-columns: 1fr; }
      .aed-mapbox { order: 1; }
      .aed-listbox { order: 2; }
      .aed-subtitle { font-size: 0.98rem; }
    }
  `;

  /* ---------- render ---------- */
  return (
    <div style={outer} className="aed-root">
      {/* injected styles for this component only (single-file) */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div style={inner}>
        <div style={pageHeader}>
          <h1 className="aed-title">🚑 SilentSOS & AED Finder</h1>
          <p className="aed-subtitle">
            Quickly locate nearest AEDs, emergency hospitals, pharmacies, police/fire, safe help points, and certified volunteer clinicians offering calm guidance while you travel to care.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="aed-card">
              <div style={headerBar}>
                <div>
                  <div className="aed-pill">SilentSOS</div>
                  <div style={{ fontSize: 15, marginTop: 6, color: "#4b5563", fontWeight: 700 }}>
                    One tap to nearest critical help.
                  </div>
                </div>

                <button
                  onClick={fetchLocation}
                  style={{ ...locateButton }}
                  className="aed-locate"
                  disabled={loading}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: location ? "#16a34a" : "#f97316",
                      boxShadow: location
                        ? "0 0 0 6px rgba(74,222,128,0.25)"
                        : "0 0 0 6px rgba(248,171,88,0.25)",
                    }}
                  />
                  {loading ? "Locating…" : location ? "Refresh location" : "Use my location"}
                </button>
              </div>

              <div className="aed-tabs" style={{ marginTop: 6 }}>
                <button
                  className={"aed-tab " + (activeType === "AED" ? "active" : "")}
                  onClick={() => setActiveType("AED")}
                  title="Find AEDs"
                >
                  ⚡ AED
                </button>
                <button
                  className={"aed-tab " + (activeType === "HOSPITAL" ? "active" : "")}
                  onClick={() => setActiveType("HOSPITAL")}
                >
                  🏥 ER Hospitals
                </button>
                <button
                  className={"aed-tab " + (activeType === "PHARMACY" ? "active" : "")}
                  onClick={() => setActiveType("PHARMACY")}
                >
                  💊 24×7 Pharmacy
                </button>
                <button
                  className={"aed-tab " + (activeType === "POLICE_FIRE" ? "active" : "")}
                  onClick={() => setActiveType("POLICE_FIRE")}
                >
                  🚓 Police / Fire
                </button>
                <button
                  className={"aed-tab " + (activeType === "SAFE" ? "active" : "")}
                  onClick={() => setActiveType("SAFE")}
                >
                  🛟 Safe Help
                </button>
                <button
                  className={"aed-tab " + (activeType === "CLINICIAN" ? "active" : "")}
                  onClick={() => setActiveType("CLINICIAN")}
                >
                  👩‍⚕️ Clinicians
                </button>
              </div>

              <div className="aed-layout" style={{ marginTop: 8 }}>
                <div className="aed-mapbox">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280" }}>
                    <span style={{ fontWeight: 800 }}>Map overview</span>
                    <span style={{ fontWeight: 700, color: "#374151" }}>
                      {location ? "Location active" : 'Approximate (tap "Use my location")'}
                    </span>
                  </div>

                  <div className="aed-minimap" role="img" aria-label="Map overview with nearby resources">
                    <div className="aed-map-grid" />
                    <div className={"aed-rad " + (location ? "active" : "")} />
                    <div className="aed-you" />
                    <div className="aed-you-label">You</div>

                    {sortedItems[0] && (
                      <div
                        className="aed-marker primary"
                        style={{ left: "63%", top: "42%" }}
                        title={`Closest ${resourceLabel}`}
                        onClick={() => {
                          const r = sortedItems[0];
                          window.open(`https://www.google.com/maps?q=${r.lat},${r.lng}`, "_blank");
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{activeIcon}</span>
                        <span style={{ fontWeight: 900 }}>Nearest {resourceLabel}</span>
                      </div>
                    )}

                    <div className="aed-marker secondary" style={{ left: "32%", top: "30%" }}>
                      <span style={{ fontSize: 16 }}>{activeIcon}</span>
                      <span style={{ fontWeight: 700 }}>Nearby</span>
                    </div>
                    <div className="aed-marker secondary" style={{ left: "72%", top: "72%" }}>
                      <span style={{ fontSize: 16 }}>{activeIcon}</span>
                      <span style={{ fontWeight: 700 }}>Nearby</span>
                    </div>
                  </div>

                  {locationError && (
                    <div style={{ marginTop: 8, fontSize: 14, color: "#b91c1c", background: "#fff2f2", borderRadius: 10, padding: 10, border: "1px solid #fecaca" }}>
                      {locationError}
                    </div>
                  )}
                </div>

                <div className="aed-listbox" aria-live="polite">
                  <div className="aed-list-header">
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>Nearest {resourceLabel}{sortedItems.length > 1 ? "s" : ""}</div>
                      <div className="aed-list-sub" style={{ marginTop: 6 }}>
                        {activeType === "CLINICIAN" ? "Tap to see connection options" : 'Tap "Open in Maps" to navigate'}
                      </div>
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 700 }}>
                      {location ? <span>Sorted by distance</span> : <span>Unsorted — enable location</span>}
                    </div>
                  </div>

                  <div className="aed-list-scroller">
                    {sortedItems.length === 0 && <div style={{ color: "#6b7280" }}>No entries available.</div>}

                    {sortedItems.map((item, idx) => (
                      <div key={item.id} className={"aed-item " + (idx === 0 ? "primary" : "")}>
                        <div className="item-left">
                          <div className="item-title">{item.name}</div>
                          <div className="item-coords">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</div>
                          {item.notes && <div className="item-notes">{item.notes}</div>}
                        </div>

                        <div className="item-actions">
                          {activeType === "CLINICIAN" ? (
                            <button
                              style={{ ...mapButton, background: "linear-gradient(135deg,#1d4ed8,#2563eb)" }}
                              onClick={() =>
                                alert(
                                  `In a production build, this would open a secure voice/video/chat session with ${item.name} via the volunteer clinician network.`
                                )
                              }
                              className="btn-map"
                            >
                              View contact options
                            </button>
                          ) : (
                            <button
                              style={mapButton}
                              onClick={() =>
                                window.open(`https://www.google.com/maps?q=${item.lat},${item.lng}`, "_blank")
                              }
                              className="btn-map"
                            >
                              Open in Maps
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="aed-note" style={{ marginTop: 8 }}>
                Locations and clinician entries are sample data for demo. In production, AEDs, facilities, and licenses/availability would be verified with local authorities and medical councils before use.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AEDFinder;