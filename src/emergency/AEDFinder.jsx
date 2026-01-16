"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
  AEDFinder — live-only resources, Leaflet map, no hardcoded/demo data
  - Removed AED and police/fire functionality entirely
  - Removed all demo / hardcoded resource lists
  - Always fetches live data from Overpass after user grants geolocation
  - If Overpass fails or returns no results, the UI shows a clear message
  - Supported resource types:  HOSPITAL, PHARMACY, SAFE (community help points), DOCTOR (volunteer physicians)
  - All UI and styles included in this single file
  - Uses precise coordinates from OpenStreetMap Overpass API for accurate locations
*/

/* fix leaflet default icons (required for many bundlers) */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x. png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------- utilities ---------- */
function getLocationOnce() {
  return new Promise((resolve) => {
    if (!navigator. geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat:  pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function distanceMeters(aLat, aLng, bLat, bLng) {
  if (aLat == null || aLng == null || bLat == null || bLng == null) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371e3; // meters
  const φ1 = toRad(aLat);
  const φ2 = toRad(bLat);
  const Δφ = toRad(bLat - aLat);
  const Δλ = toRad(bLng - aLng);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/* ---------- Overpass fetch helper (live-only) with precise coordinates ---------- */
async function fetchPlaces(lat, lng, type) {
  const radius = 3000;

  const queries = {
    HOSPITAL: `node["amenity"="hospital"](around: ${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng});relation["amenity"="hospital"](around:${radius},${lat},${lng});`,
    PHARMACY: `node["amenity"="pharmacy"](around:${radius},${lat},${lng});way["amenity"="pharmacy"](around:${radius},${lat},${lng});relation["amenity"="pharmacy"](around:${radius},${lat},${lng});`,
    SAFE: `
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      way["amenity"="community_centre"](around:${radius},${lat},${lng});
      relation["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["social_facility"](around:${radius},${lat},${lng});
      way["social_facility"](around:${radius},${lat},${lng});
      relation["social_facility"](around:${radius},${lat},${lng});
    `,
    DOCTOR: `
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
      relation["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="doctors"](around:${radius},${lat},${lng});
      way["amenity"="doctors"](around:${radius},${lat},${lng});
      relation["amenity"="doctors"](around:${radius},${lat},${lng});
    `,
  };

  const query = `
    [out:json][timeout:25];
    (${queries[type] || ""});
    out center;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Overpass request failed (${res.status}) ${txt}`);
  }
  const data = await res.json();

  return (data.elements || []).map((e) => {
    // Use precise node coordinates if available, otherwise use center of way/relation
    const preciseLat = e.lat ??  e.center?. lat ??  null;
    const preciseLng = e.lon ?? e.center?.lon ?? null;
    return {
      id: `${e.type}/${e.id}`,
      name: e.tags?.name || e.tags?.operator || "Unnamed",
      lat: preciseLat,
      lng: preciseLng,
      notes: Object.entries(e.tags || {})
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
      tags: e.tags || {},
    };
  }).filter((i) => i.lat != null && i.lng != null);
}

/* ---------- component ---------- */
export default function AEDFinder() {
  const [location, setLocation] = useState(null); // {lat,lng}
  const [activeType, setActiveType] = useState("HOSPITAL"); // default to hospitals
  const [items, setItems] = useState([]); // live items only (now limited to top 3)
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [dataError, setDataError] = useState("");
  const mapRef = useRef(null);

  // fetch location + live places
  const fetchLocationAndPlaces = async (type = activeType) => {
    setLocationError("");
    setDataError("");
    setLoading(true);
    try {
      const loc = await getLocationOnce();
      if (!loc) {
        setLocationError("Location unavailable or permission denied.");
        setItems([]);
        setLocation(null);
        setLoading(false);
        return;
      }
      setLocation(loc);

      // fetch places for provided type
      try {
        const live = await fetchPlaces(loc. lat, loc.lng, type);
        if (! live || live.length === 0) {
          setItems([]);
          setDataError("No live results found nearby.  Try widening your search area or enabling location in a different spot.");
        } else {
          // compute distance and sort, then keep only top 3
          const unified = live.map((it) => ({
            ...it,
            distance: distanceMeters(loc.lat, loc.lng, it.lat, it.lng),
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 3);
          setItems(unified);
        }
      } catch (e) {
        console.warn("Overpass error:", e);
        setItems([]);
        setDataError("Failed to fetch live resources. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // When activeType changes, if we already have a location fetch new places
  useEffect(() => {
    if (! location) return;
    (async () => {
      setLoading(true);
      setDataError("");
      try {
        const live = await fetchPlaces(location.lat, location.lng, activeType);
        if (!live || live.length === 0) {
          setItems([]);
          setDataError("No live results found for selected resource nearby.");
        } else {
          const unified = live.map((it) => ({
            ...it,
            distance: distanceMeters(location.lat, location.lng, it.lat, it.lng),
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 3);
          setItems(unified);
        }
      } catch (e) {
        console.warn("Overpass error:", e);
        setItems([]);
        setDataError("Failed to fetch live resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [activeType]);

  // open in maps:  center Leaflet map to the selected coords (if map exists), otherwise open external
  const openInMaps = (lat, lng) => {
    if (mapRef.current) {
      try {
        // center map to the exact precise coordinates and open a popup there
        mapRef.current.setView([lat, lng], 18, { animate: true });

        // create and open a temporary popup at the exact precise coordinates so user sees the spot
        const popup = L.popup({ autoClose: true, closeOnClick: true })
          .setLatLng([lat, lng])
          .setContent(`<div style='font-weight: 800'>Selected location</div><div style='font-size: 12px;color:#666'>${lat. toFixed(6)}, ${lng.toFixed(6)}</div>`);
        popup.openOn(mapRef.current);
      } catch (e) {
        // fallback to external if something goes wrong
        window.open(`https://www.google.com/maps/search/? api=1&query=${lat},${lng}`, "_blank");
      }
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
    }
  };

  /* ---------- styles (kept from previous design) ---------- */
  const outer = {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: "1. 25rem",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#fff",
  };

  const inner = {
    width: "100%",
    maxWidth: "1320px",
    display: "flex",
    flexDirection: "column",
    gap:  "1rem",
  };

  const pageHeader = { marginBottom: "0.25rem" };

  const headerBar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  };

  const locateButton = {
    display: "inline-flex",
    alignItems:  "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #fecaca",
    background: "linear-gradient(135deg,#fff,#fee2e2)",
    fontWeight: 800,
    cursor: "pointer",
  };

  const mapButton = {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
  };

  const css = `
    .title { font-weight: 900; color:#b91c1c; font-size:  clamp(1.6rem,4. 5vw,2.4rem); margin:  0; display: flex; align-items: center; gap:. 5rem; }
    .subtitle { margin-top:6px; color:#6b7280; font-size:  1rem; max-width:880px; }
    .card { border-radius: 16px; padding:16px; background:  linear-gradient(180deg,#fff,#fff7f7); box-shadow:0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(252,165,165,0.2); }
    .tabs { display:flex; gap:8px; margin-top:10px; flex-wrap:  wrap; }
    .tab { padding:8px 12px; border-radius:999px; border:1px solid #fecaca; background:#fff; cursor:pointer; font-weight:700; }
    .tab.active { background:  linear-gradient(135deg,#fee2e2,#fecaca); border-color:#ef4444; }
    .layout { display:grid; grid-template-columns:  1.45fr 1fr; gap:16px; margin-top:12px; }
    .mapbox { border-radius:12px; overflow:hidden; min-height:320px; position:relative; border:1px solid #fca5a5; background:#fff; }
    .listbox { border-radius:12px; padding:12px; border:1px solid #fecaca; background:  linear-gradient(180deg,#fff,#fff7f7); min-height:320px; overflow-y:auto; }
    .list-item { display:flex; justify-content:space-between; gap:12px; padding:12px; border-radius:10px; background:#fff; border:1px solid #e5e7eb; margin-bottom:10px; }
    .item-title { font-weight:800; }
    .muted { color:#6b7280; }
    @media (max-width:980px) { .layout { grid-template-columns: 1fr; } }
  `;

  return (
    <div style={outer}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={inner}>
        <div style={pageHeader}>
          <h1 className="title">Live Resource Finder</h1>
          <p className="subtitle">
            Locate live emergency hospitals, pharmacies, physicians and community help points from OpenStreetMap.  Precise coordinates from real-time Overpass data.
          </p>
        </div>

        <div className="card">
          <div style={headerBar}>
            <div>
              <div style={{ fontWeight: 900, color: "#064e3b" }}>Live search</div>
              <div style={{ marginTop: 6, color: "#475569" }}>Tap to allow location and fetch nearby live resources from OpenStreetMap with precise coordinates. </div>
            </div>

            <div>
              <button
                onClick={() => fetchLocationAndPlaces()}
                disabled={loading}
                style={locateButton}
                aria-label="Use my location"
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: location ?  "#16a34a" : "#f97316" }} />
                {loading ? "Working…" : location ? "Refresh location" : "Use my location"}
              </button>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${activeType === "HOSPITAL" ?  "active" : ""}`} onClick={() => setActiveType("HOSPITAL")}>🏥 Hospitals</button>
            <button className={`tab ${activeType === "PHARMACY" ? "active" : ""}`} onClick={() => setActiveType("PHARMACY")}>💊 Pharmacies</button>
            <button className={`tab ${activeType === "DOCTOR" ? "active" : ""}`} onClick={() => setActiveType("DOCTOR")}>👨‍⚕️ Physicians</button>
            <button className={`tab ${activeType === "SAFE" ? "active" :  ""}`} onClick={() => setActiveType("SAFE")}>🛟 Community Help</button>
          </div>

          <div className="layout" style={{ marginTop: 12 }}>
            <div className="mapbox" aria-live="polite" aria-label="Map and search results" style={{ minHeight: 320 }}>
              {location ?  (
                <MapContainer whenCreated={(m) => { mapRef.current = m; }} center={[location.lat, location.lng]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
                  <Marker position={[location.lat, location. lng]}>
                    <Popup>Your location</Popup>
                  </Marker>
                  <Circle center={[location.lat, location.lng]} radius={2000} pathOptions={{ color: "#fca5a5", weight: 1, dashArray: "6" }} />
                  {items.map((it) => (
                    <Marker key={it.id} position={[it.lat, it. lng]}>
                      <Popup>
                        <div style={{ fontWeight: 800 }}>{it.name}</div>
                        <div style={{ marginTop: 4, fontSize: "12px", color: "#666" }}>
                          {it.lat. toFixed(6)}, {it.lng.toFixed(6)}
                        </div>
                        {it.notes && <div style={{ marginTop: 6 }}>{it.notes}</div>}
                        <div style={{ marginTop: 6 }}>
                          <button onClick={() => openInMaps(it.lat, it.lng)} style={{ padding: "6px 10px", borderRadius: 8, background: "#06b6d4", color: "#fff", border: "none" }}>Show on map</button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div style={{ padding: 18, color: "#6b7280" }}>
                  Location not set.  Tap "Use my location" to allow the browser to share your location and fetch live resources from OpenStreetMap.
                </div>
              )}
            </div>

            <div className="listbox">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div style={{ fontWeight: 900 }}>
                  {activeType === "HOSPITAL" ?  "Nearby Hospitals" : activeType === "PHARMACY" ? "Nearby Pharmacies" : activeType === "DOCTOR" ? "Nearby Physicians" : "Community Help Points"}
                </div>
                <div className="muted" style={{ fontWeight: 700 }}>{location ? "Live results (top 3)" : "Waiting for location"}</div>
              </div>

              {locationError && <div style={{ color: "crimson", marginBottom: 10 }}>{locationError}</div>}
              {dataError && <div style={{ color: "crimson", marginBottom: 10 }}>{dataError}</div>}

              {items.length === 0 && ! dataError && ! location && (
                <div className="muted">No results yet. Allow location and fetch live resources.</div>
              )}

              {items.length === 0 && !! dataError && (
                <div className="muted">{dataError}</div>
              )}

              {items.map((it, idx) => (
                <div key={it. id} className="list-item" style={idx === 0 ? { borderColor: "#f97373", background: "#fff1f1" } : undefined}>
                  <div>
                    <div className="item-title">{it. name}</div>
                    <div className="muted" style={{ marginTop: 6, fontSize: "13px", fontFamily: "monospace" }}>
                      {it.lat.toFixed(8)}, {it.lng.toFixed(8)}
                    </div>
                    {it.notes && <div style={{ marginTop: 6, color: "#b91c1c", fontWeight: 700, fontSize: "13px" }}>{it.notes}</div>}
                    {it.distance != null && <div style={{ marginTop: 6 }} className="muted">{it.distance} m away</div>}
                  </div>

                  <div style={{ display:  "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn-map" style={mapButton} onClick={() => openInMaps(it.lat, it.lng)}>Open in Maps</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
                Results are live from OpenStreetMap via Overpass with precise GPS coordinates. If you see no results, try moving to a different location or increase the radius in code, or try again later.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}