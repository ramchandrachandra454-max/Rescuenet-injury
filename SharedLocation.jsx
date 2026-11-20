import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowUpRight, Clock3, MapPin, Radio, ShieldCheck } from "lucide-react";
import MapView from "./MapView.jsx";

export default function SharedLocation({ token }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function refreshLocation() {
      try {
        const response = await fetch(`/api/location-shares/${token}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "This location link has expired or was terminated.");
        if (active) {
          setLocation(result);
          setError("");
          setLoading(false);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Could not fetch live location.");
          setLoading(false);
        }
      }
    }

    refreshLocation();
    const timer = window.setInterval(refreshLocation, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token]);

  const mapUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : "https://www.google.com/maps";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1220",
      color: "#F8FAFC",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <header style={{ width: "100%", maxWidth: "640px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #EF3340 0%, #B91C1C 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            IA
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>Injury<span style={{ color: "#00D9FF" }}>AI</span></span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "999px", background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
          <Radio size={13} /> LIVE TELEMETRY
        </div>
      </header>

      <main style={{
        width: "100%",
        maxWidth: "640px",
        background: "rgba(20, 36, 58, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🛰️</div>
            <p style={{ color: "#94A3B8" }}>Connecting to live emergency GPS stream...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <AlertCircle size={44} color="#EF3340" style={{ marginBottom: "12px" }} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>Live Stream Ended</h2>
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginBottom: "20px" }}>{error}</p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#00D9FF", fontSize: "0.85rem", textDecoration: "none" }}>
              <ArrowLeft size={16} /> Return to InjuryAI Home
            </a>
          </div>
        ) : location ? (
          <>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#00D9FF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Active GPS Beacon
              </span>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "4px 0" }}>Live Responder Coordinates</h1>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                Encrypted position stream updating every 4 seconds.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              background: "rgba(11, 18, 32, 0.7)",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <div>
                <span style={{ fontSize: "0.7rem", color: "#64748B" }}>LATITUDE</span>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                  {location.latitude.toFixed(5)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "0.7rem", color: "#64748B" }}>LONGITUDE</span>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                  {location.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            <div style={{ height: "320px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <MapView location={location} userName="Live Location" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#94A3B8" }}>
                <Clock3 size={15} color="#00D9FF" />
                <span>Last signal: {new Date(location.updatedAt).toLocaleTimeString()}</span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #3478F6 0%, #00D9FF 100%)",
                  color: "#0B1220",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none"
                }}
              >
                Open in Google Maps <ArrowUpRight size={14} />
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "#64748B", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
              <ShieldCheck size={16} color="#22C55E" />
              <span>Session protected. Link self-destructs after 1 hour or when stopped by user.</span>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
