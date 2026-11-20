import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, HeartPulse, Phone, ShieldCheck, User } from "lucide-react";

export default function EmergencyProfile({ token }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/emergency-profiles/${token}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "This emergency profile is not available or has expired.");
        if (active) {
          setProfile(result);
          setLoading(false);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Could not load this emergency profile.");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [token]);

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
      <header style={{ width: "100%", maxWidth: "520px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#FFFFFF" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #EF3340 0%, #B91C1C 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            IA
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>Injury<span style={{ color: "#00D9FF" }}>AI</span></span>
        </a>
        <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: "rgba(0, 217, 255, 0.15)", color: "#00D9FF", border: "1px solid rgba(0, 217, 255, 0.3)" }}>
          VERIFIED MEDICAL ID
        </span>
      </header>

      <main style={{
        width: "100%",
        maxWidth: "520px",
        background: "rgba(20, 36, 58, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🩺</div>
            <p style={{ color: "#94A3B8" }}>Loading emergency profile telemetry...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <AlertCircle size={44} color="#EF3340" style={{ marginBottom: "12px" }} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>Profile Unavailable</h2>
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginBottom: "20px" }}>{error}</p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#00D9FF", fontSize: "0.85rem", textDecoration: "none" }}>
              <ArrowLeft size={16} /> Return to InjuryAI Home
            </a>
          </div>
        ) : profile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3478F6 0%, #00D9FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800 }}>
                {profile.name?.charAt(0) || "P"}
              </div>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>{profile.name}</h1>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Emergency Medical Information</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(11, 18, 32, 0.6)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Blood Group</span>
                <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#EF3340", margin: "4px 0 0 0" }}>
                  {profile.bloodGroup || "Not Specified"}
                </p>
              </div>
              <div style={{ background: "rgba(11, 18, 32, 0.6)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created</span>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F8FAFC", margin: "6px 0 0 0" }}>
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ background: "rgba(11, 18, 32, 0.6)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#F97316", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ⚠️ Allergies & Sensitivities
              </span>
              <p style={{ fontSize: "0.92rem", color: "#F8FAFC", marginTop: "6px", lineHeight: "1.4" }}>
                {profile.allergies || "None reported"}
              </p>
            </div>

            <div style={{ background: "rgba(11, 18, 32, 0.6)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#00D9FF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📋 Medical Conditions & Notes
              </span>
              <p style={{ fontSize: "0.92rem", color: "#F8FAFC", marginTop: "6px", lineHeight: "1.4" }}>
                {profile.conditions || "None reported"}
              </p>
            </div>

            {profile.emergencyContactName && (
              <div style={{
                background: "linear-gradient(135deg, rgba(239, 51, 64, 0.15) 0%, rgba(20, 36, 58, 0.8) 100%)",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid rgba(239, 51, 64, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#EF3340", textTransform: "uppercase" }}>
                  Primary Emergency Contact
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "1.05rem", display: "block" }}>{profile.emergencyContactName}</strong>
                    <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>{profile.emergencyContactPhone || "No phone listed"}</span>
                  </div>
                  {profile.emergencyContactPhone && (
                    <a
                      href={`tel:${profile.emergencyContactPhone}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#EF3340",
                        color: "#FFFFFF",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        textDecoration: "none"
                      }}
                    >
                      <Phone size={16} /> Call Now
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "#64748B", marginTop: "8px" }}>
              <ShieldCheck size={16} color="#22C55E" />
              <span>Verify medical details directly with patient or emergency responders.</span>
            </div>
          </div>
        ) : null}
      </main>

      <footer style={{ marginTop: "24px", textAlign: "center", color: "#64748B", fontSize: "0.8rem", maxWidth: "520px" }}>
        InjuryAI — Smart Emergency Assistance & First-Aid Telemetry Platform.
      </footer>
    </div>
  );
}
