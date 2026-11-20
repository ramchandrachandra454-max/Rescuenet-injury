import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./MapView.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LandingHero from "./components/LandingHero.jsx";
import RedAlertModal from "./components/RedAlertModal.jsx";
import HospitalFinderView from "./components/HospitalFinderView.jsx";
import VolunteerNetworkView from "./components/VolunteerNetworkView.jsx";
import EmergencyTrackerView from "./components/EmergencyTrackerView.jsx";
import AdminDashboardView from "./components/AdminDashboardView.jsx";
import PreparednessGuideModal from "./components/PreparednessGuideModal.jsx";
import ChecklistModal from "./components/ChecklistModal.jsx";
import OfflineGuideModal from "./components/OfflineGuideModal.jsx";
import ContactsModal from "./components/ContactsModal.jsx";
import AssistantModal from "./components/AssistantModal.jsx";
import translations from "./translations.js";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Bot,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Hospital,
  ImagePlus,
  LocateFixed,
  MapPin,
  Phone,
  Plus,
  QrCode,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Users,
  X
} from "lucide-react";

const defaultContacts = [
  { name: "Dr. Sarah Lin", relation: "Family Physician", phone: "+1 (555) 234-8890", initials: "SL", color: "lavender" },
  { name: "Marcus Holloway", relation: "EMT Contact", phone: "+1 (555) 302-8876", initials: "MH", color: "peach" },
  { name: "Claire Dupont", relation: "Emergency Sibling", phone: "+1 (555) 778-9900", initials: "CD", color: "mint" }
];

const initialHospitals = [
  { id: "hosp-1", name: "Central Trauma & Emergency Center", category: "hospital", address: "742 Healthcare Blvd, Metro City", emergencyRoom: true, traumaLevel: "Level 1", latitude: 37.7749, longitude: -122.4194, phone: "+1 (555) 911-2000" },
  { id: "hosp-2", name: "Saint Jude Community Hospital", category: "hospital", address: "1200 Mercy Avenue, Metro City", emergencyRoom: true, traumaLevel: "Level 2", latitude: 37.7833, longitude: -122.4167, phone: "+1 (555) 911-3400" },
  { id: "hosp-3", name: "Apex Urgent Care & Walk-in Clinic", category: "urgent_care", address: "450 Market St, Suite 100", emergencyRoom: false, traumaLevel: "None", latitude: 37.7899, longitude: -122.4011, phone: "+1 (555) 234-5678" },
  { id: "hosp-4", name: "Memorial Children & Pediatric ER", category: "hospital", address: "890 Hope Way, Metro City", emergencyRoom: true, traumaLevel: "Pediatric Level 1", latitude: 37.7650, longitude: -122.4350, phone: "+1 (555) 911-8800" }
];

const initialVolunteers = [
  { id: "vol-1", name: "Dr. Elena Vance", role: "Emergency Physician", badge: "Medical Doctor", cprCertified: true, firstAidCertified: true, status: "available", rating: 4.95, responsesCount: 42, verified: true, latitude: 37.7780, longitude: -122.4150 },
  { id: "vol-2", name: "Marcus Holloway", role: "Paramedic / EMT", badge: "Certified EMT", cprCertified: true, firstAidCertified: true, status: "available", rating: 4.88, responsesCount: 56, verified: true, latitude: 37.7710, longitude: -122.4230 },
  { id: "vol-3", name: "Aisha Patel", role: "First Aid Responder", badge: "CPR / First Aid", cprCertified: true, firstAidCertified: true, status: "available", rating: 4.92, responsesCount: 28, verified: true, latitude: 37.7810, longitude: -122.4090 },
  { id: "vol-4", name: "James Wilson", role: "Community Safety Volunteer", badge: "Community Responder", cprCertified: true, firstAidCertified: false, status: "offline", rating: 4.75, responsesCount: 16, verified: false, latitude: 37.7690, longitude: -122.4400 }
];

const initialRequests = [
  { id: "REQ-90124", category: "Accident", priority: "Critical", description: "Multi-vehicle collision near intersection with fluid leak. Responders paged.", latitude: 37.7755, longitude: -122.4180, status: "acknowledged", contactName: "David Kim", createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
  { id: "REQ-90118", category: "Medical emergency", priority: "Critical", description: "Elderly resident experiencing acute shortness of breath and chest tightness.", latitude: 37.7812, longitude: -122.4110, status: "resolved", contactName: "Claire Dupont", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
];

export default function App() {
  // Navigation & Theme State
  const [activeView, setActiveView] = useState("overview"); // 'overview', 'hospitals', 'volunteers', 'tracking', 'map', 'admin'
  const [activeModal, setActiveModal] = useState(""); // 'redAlert', 'assistant', 'preparedness', 'checklist', 'offline', 'contacts', 'qr', 'report'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("injuryai-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(() => {
    try {
      return localStorage.getItem("injuryai-accessibility") === "true";
    } catch {
      return false;
    }
  });
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("injuryai-language");
      return ["en", "hi", "pa"].includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  // Location & Sharing State
  const [location, setLocation] = useState(null);
  const [locationState, setLocationState] = useState("idle"); // 'idle', 'loading', 'ready', 'error'
  const [locationError, setLocationError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const watchIdRef = useRef(null);
  const shareTokenRef = useRef("");

  // Real Database Records & Stats
  const [stats, setStats] = useState({
    totalRequests: 2,
    activeRequests: 1,
    resolvedRequests: 1,
    totalVolunteers: 4,
    availableVolunteers: 3,
    nearbyHospitals: 4
  });
  const [emergencyRequests, setEmergencyRequests] = useState(initialRequests);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [activeTrackingId, setActiveTrackingId] = useState("");

  // Trusted Contacts
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem("injuryai-contacts");
      return saved ? JSON.parse(saved) : defaultContacts;
    } catch {
      return defaultContacts;
    }
  });

  // QR Profile State
  const [qrToken, setQrToken] = useState(() => {
    try {
      return localStorage.getItem("injuryai-qr-token") || "";
    } catch {
      return "";
    }
  });
  const [emergencyProfile, setEmergencyProfile] = useState({
    name: "Alex Vance",
    bloodGroup: "O+",
    allergies: "Penicillin, Peanuts",
    conditions: "Mild Asthma",
    emergencyContactName: "Dr. Sarah Lin",
    emergencyContactPhone: "+1 (555) 234-8890"
  });

  // Incident Report State
  const [reportDescription, setReportDescription] = useState("");
  const [reportPhoto, setReportPhoto] = useState(null);
  const [reportSent, setReportSent] = useState(false);

  // Quick Dashboard AI Assistant State
  const [dashAssistantQuestion, setDashAssistantQuestion] = useState("");
  const [dashAssistantReply, setDashAssistantReply] = useState("");
  const [dashAssistantLoading, setDashAssistantLoading] = useState(false);

  // Global Alerts / Status Message
  const [statusNotification, setStatusNotification] = useState("");

  const t = (key) => translations[language]?.[key] || translations.en?.[key] || key;

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
    try {
      localStorage.setItem("injuryai-theme", theme);
    } catch {}
  }, [theme]);

  // Sync accessibility with HTML class
  useEffect(() => {
    if (accessibilityEnabled) {
      document.documentElement.classList.add("accessibility-mode");
    } else {
      document.documentElement.classList.remove("accessibility-mode");
    }
    try {
      localStorage.setItem("injuryai-accessibility", String(accessibilityEnabled));
    } catch {}
  }, [accessibilityEnabled]);

  // Sync contacts with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("injuryai-contacts", JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  // Sync language
  useEffect(() => {
    try {
      localStorage.setItem("injuryai-language", language);
    } catch {}
    document.documentElement.lang = language;
  }, [language]);

  // Auto-fetch data on mount
  useEffect(() => {
    loadAllPlatformData();
    const interval = setInterval(loadAllPlatformData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Nearby Care when location changes
  useEffect(() => {
    if (!location) return;
    const query = new URLSearchParams({
      lat: String(location.latitude.toFixed(2)),
      lng: String(location.longitude.toFixed(2))
    });
    fetch(`/api/places/nearby?${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.places) setNearbyPlaces(data.places);
      })
      .catch(() => {});
  }, [location]);

  // Attempt initial GPS capture gently
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocation({ latitude: coords.latitude, longitude: coords.longitude });
          setLocationState("ready");
        },
        () => {
          // Default to San Francisco metropolitan coordinates if permission denied
          setLocation({ latitude: 37.7749, longitude: -122.4194 });
          setLocationState("ready");
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  async function loadAllPlatformData() {
    try {
      const [statsRes, reqsRes, volsRes, hospsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/emergency-requests"),
        fetch("/api/volunteers"),
        fetch("/api/hospitals")
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (reqsRes.ok) {
        const r = await reqsRes.json();
        setEmergencyRequests(r.requests || []);
      }
      if (volsRes.ok) {
        const v = await volsRes.json();
        setVolunteers(v.volunteers || []);
      }
      if (hospsRes.ok) {
        const h = await hospsRes.json();
        setHospitals(h.hospitals || []);
      }
    } catch {
      // Offline or network error
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationState("error");
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationState("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationState("ready");
      },
      (err) => {
        setLocationState("error");
        setLocationError(`Location request failed: ${err.message}. Using default coordinates.`);
        setLocation({ latitude: 37.7749, longitude: -122.4194 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function toggleLiveLocationSharing() {
    if (sharing) {
      // Stop sharing
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (shareTokenRef.current) {
        try {
          await fetch(`/api/location-shares/${shareTokenRef.current}`, { method: "DELETE" });
        } catch {}
      }
      shareTokenRef.current = "";
      setSharing(false);
      setShareUrl("");
      setStatusNotification("Live GPS beacon terminated.");
      setTimeout(() => setStatusNotification(""), 3500);
      return;
    }

    if (!location) {
      getCurrentLocation();
      setStatusNotification("Please enable GPS coordinates before initiating live location beacon.");
      setTimeout(() => setStatusNotification(""), 4000);
      return;
    }

    try {
      const res = await fetch("/api/location-shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start live location beacon.");

      const fullUrl = new URL(`/share/${data.token}`, window.location.origin).toString();
      shareTokenRef.current = data.token;
      setShareUrl(fullUrl);
      setSharing(true);
      setStatusNotification("Live GPS beacon active! Private 1-hour tracking URL created.");
      setTimeout(() => setStatusNotification(""), 4500);

      // Start watcher
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          ({ coords }) => {
            const next = { latitude: coords.latitude, longitude: coords.longitude };
            setLocation(next);
            fetch(`/api/location-shares/${data.token}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(next)
            }).catch(() => {});
          },
          () => {},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
      }
    } catch (e) {
      setLocationError(e.message);
    }
  }

  function handleAlertCreated(newRequest) {
    setEmergencyRequests((prev) => [newRequest, ...prev]);
    setActiveTrackingId(newRequest.id);
    setActiveView("tracking");
    setStatusNotification(`🚨 Emergency Alert #${newRequest.id} broadcast successfully to verified responders!`);
    loadAllPlatformData();
  }

  async function handleRegisterVolunteer(volData) {
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...volData, ...location })
      });
      const data = await res.json();
      if (res.ok) {
        setVolunteers((prev) => [...prev, data]);
        loadAllPlatformData();
        return data;
      }
    } catch {}
    return null;
  }

  async function handleUpdateVolunteerStatus(id, updates) {
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setVolunteers((prev) => prev.map((v) => (v.id === id ? updated : v)));
        loadAllPlatformData();
      }
    } catch {}
  }

  async function handleVerifyVolunteer(id, verified) {
    await handleUpdateVolunteerStatus(id, { verified });
  }

  async function handleRespondToRequest(volunteerId, requestId) {
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
      });
      if (res.ok) {
        loadAllPlatformData();
        setActiveTrackingId(requestId);
        setActiveView("tracking");
      }
    } catch {}
  }

  async function handleUpdateEmergencyStatus(requestId, updates) {
    try {
      const res = await fetch(`/api/emergency-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmergencyRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
        loadAllPlatformData();
      }
    } catch {}
  }

  async function handleAddHospital(hospitalData) {
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalData)
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals((prev) => [...prev, data]);
        loadAllPlatformData();
      }
    } catch {}
  }

  async function handleSaveEmergencyProfile(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/emergency-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emergencyProfile)
      });
      const data = await res.json();
      if (res.ok) {
        setQrToken(data.token);
        localStorage.setItem("injuryai-qr-token", data.token);
        setStatusNotification("QR Medical Emergency Profile updated successfully!");
        setTimeout(() => setStatusNotification(""), 3500);
      }
    } catch {}
  }

  async function handleSubmitIncidentReport(e) {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    const formData = new FormData();
    formData.set("description", reportDescription);
    if (location) {
      formData.set("latitude", String(location.latitude));
      formData.set("longitude", String(location.longitude));
    }
    if (reportPhoto) formData.set("photo", reportPhoto);

    try {
      const res = await fetch("/api/incident-reports", { method: "POST", body: formData });
      if (res.ok) {
        setReportSent(true);
        setReportDescription("");
        setReportPhoto(null);
        setTimeout(() => {
          setReportSent(false);
          setActiveModal("");
        }, 2500);
      }
    } catch {}
  }

  async function handleDashAssistantSubmit(e) {
    e.preventDefault();
    if (!dashAssistantQuestion.trim() || dashAssistantLoading) return;
    const query = dashAssistantQuestion.trim();
    setDashAssistantQuestion("");
    setDashAssistantLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, language })
      });
      const data = await res.json();
      if (res.ok) {
        setDashAssistantReply(data.reply);
      }
    } catch {
      setDashAssistantReply("Could not connect to AI service. Please contact 911 / 112 directly.");
    } finally {
      setDashAssistantLoading(false);
    }
  }

  const qrUrl = qrToken ? `${window.location.origin}/emergency/${qrToken}` : "";
  const allHospitalsList = nearbyPlaces.length > 0 ? nearbyPlaces : hospitals;

  return (
    <div className={`app-container ${accessibilityEnabled ? "accessibility-mode" : ""}`}>
      {/* Ambient Glows */}
      <div className="bg-ambient-glow" aria-hidden="true">
        <div className="glow-spot-1" />
        <div className="glow-spot-2" />
      </div>

      {/* Modern Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        contactsCount={contacts.length}
        activeEmergenciesCount={stats.activeRequests || 0}
        availableVolunteersCount={stats.availableVolunteers || 0}
        onOpenModal={setActiveModal}
        t={t}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          location={location}
          locationState={locationState}
          onRefreshLocation={getCurrentLocation}
          language={language}
          onChangeLanguage={setLanguage}
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          accessibilityEnabled={accessibilityEnabled}
          onToggleAccessibility={() => setAccessibilityEnabled(!accessibilityEnabled)}
          onOpenAssistant={() => setActiveModal("assistant")}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          activeViewTitle={
            activeView === "overview"
              ? "Emergency Dashboard"
              : activeView === "hospitals"
              ? "Hospital Finder"
              : activeView === "volunteers"
              ? "Volunteer Network"
              : activeView === "tracking"
              ? "Live Tracking"
              : activeView === "map"
              ? "Interactive Map"
              : "Admin Center"
          }
          t={t}
        />

        {/* Global Notification Banner */}
        {statusNotification && (
          <div style={{
            background: "linear-gradient(90deg, rgba(0, 217, 255, 0.2) 0%, rgba(52, 120, 246, 0.2) 100%)",
            borderBottom: "1px solid rgba(0, 217, 255, 0.4)",
            padding: "10px 24px",
            color: "#FFFFFF",
            fontSize: "0.86rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Sparkles size={16} color="#00D9FF" />
              <span>{statusNotification}</span>
            </div>
            <button onClick={() => setStatusNotification("")} style={{ color: "#94A3B8" }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Live GPS Sharing Banner */}
        {sharing && (
          <div style={{
            background: "linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(20, 36, 58, 0.9) 100%)",
            borderBottom: "1px solid rgba(34, 197, 94, 0.4)",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "0.85rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22C55E" }}>
              <Radio size={16} className="siren-icon-pulse" />
              <strong>Live GPS Beacon Active:</strong>
              <span style={{ color: "#CBD5E1" }}>Link auto-expires in 1 hour.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                readOnly
                value={shareUrl}
                style={{ background: "rgba(11, 18, 32, 0.7)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.78rem", color: "#00D9FF", width: "220px" }}
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  } catch {}
                }}
                className="primary-action-btn"
                style={{ padding: "4px 12px", fontSize: "0.78rem" }}
              >
                {shareCopied ? <Check size={13} /> : null}
                <span>{shareCopied ? "Copied" : "Copy Link"}</span>
              </button>
              <button
                onClick={toggleLiveLocationSharing}
                style={{ color: "#EF3340", fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px", border: "1px solid rgba(239, 51, 64, 0.4)", borderRadius: "6px" }}
              >
                Stop Beacon
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Pages */}
        <main className="page-container">
          {activeView === "overview" && (
            <div>
              {/* HERO SECTION */}
              <LandingHero
                stats={stats}
                onTriggerSOS={() => setActiveModal("redAlert")}
                onNavigate={setActiveView}
                onStartSharing={toggleLiveLocationSharing}
                isSharing={sharing}
                t={t}
              />

              {/* REAL DATABASE STATS CARDS */}
              <div className="stats-cards-row">
                <div className="stat-metric-card" style={{ "--card-accent": "#EF3340" }}>
                  <div className="stat-icon-wrap"><ShieldAlert size={20} /></div>
                  <div className="stat-info-wrap">
                    <h4>{stats.totalRequests ?? 0}</h4>
                    <p>{t("stats").total}</p>
                  </div>
                </div>
                <div className="stat-metric-card" style={{ "--card-accent": "#F97316" }}>
                  <div className="stat-icon-wrap"><Radio size={20} /></div>
                  <div className="stat-info-wrap">
                    <h4>{stats.activeRequests ?? 0}</h4>
                    <p>{t("stats").active}</p>
                  </div>
                </div>
                <div className="stat-metric-card" style={{ "--card-accent": "#22C55E" }}>
                  <div className="stat-icon-wrap"><ShieldCheck size={20} /></div>
                  <div className="stat-info-wrap">
                    <h4>{stats.resolvedRequests ?? 0}</h4>
                    <p>{t("stats").resolved}</p>
                  </div>
                </div>
                <div className="stat-metric-card" style={{ "--card-accent": "#00D9FF" }}>
                  <div className="stat-icon-wrap"><Users size={20} /></div>
                  <div className="stat-info-wrap">
                    <h4>{stats.availableVolunteers ?? 0}</h4>
                    <p>{t("stats").volunteers}</p>
                  </div>
                </div>
                <div className="stat-metric-card" style={{ "--card-accent": "#3478F6" }}>
                  <div className="stat-icon-wrap"><Hospital size={20} /></div>
                  <div className="stat-info-wrap">
                    <h4>{stats.nearbyHospitals ?? 4}</h4>
                    <p>{t("stats").hospitals}</p>
                  </div>
                </div>
              </div>

              {/* TWO-COLUMN DASHBOARD GRID */}
              <div className="dashboard-grid">
                {/* Left Column: Live Map Preview & Hospitals Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="glass-panel">
                    <div className="panel-header-row">
                      <div className="panel-header-title">
                        <MapPin size={20} color="#00D9FF" />
                        <h2>{t("careAround")}</h2>
                      </div>
                      <button onClick={() => setActiveView("map")} className="panel-action-link">
                        {t("openMap")} <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className="map-canvas-wrapper">
                      {location ? (
                        <MapView
                          location={location}
                          places={allHospitalsList}
                          emergencyRequests={emergencyRequests}
                          volunteers={volunteers}
                          userName="You"
                        />
                      ) : (
                        <div className="map-empty-state">
                          <div className="map-empty-icon"><LocateFixed size={24} /></div>
                          <strong>{t("loadMap")}</strong>
                          <p style={{ fontSize: "0.82rem", color: "#94A3B8" }}>{t("locationPrivate")}</p>
                          <button onClick={getCurrentLocation} className="primary-action-btn" style={{ padding: "8px 16px" }}>
                            {t("findLocation")}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nearby Hospitals List Preview */}
                    <div className="data-list-stack">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                          Nearest Certified Facilities
                        </span>
                        <button onClick={() => setActiveView("hospitals")} style={{ fontSize: "0.78rem", color: "#00D9FF", fontWeight: 600 }}>
                          View All ({allHospitalsList.length}) →
                        </button>
                      </div>

                      {allHospitalsList.slice(0, 3).map((h) => (
                        <div key={h.id || h.name} className="data-row-card">
                          <div className="data-row-left">
                            <div className="data-icon-pill red">
                              <Hospital size={18} />
                            </div>
                            <div className="data-text-col">
                              <strong>{h.name}</strong>
                              <small>{h.category?.replace("_", " ") || "Hospital"} {h.emergencyRoom || h.emergency ? "• 24/7 ER" : ""}</small>
                            </div>
                          </div>
                          {location && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${h.latitude},${h.longitude}&travelmode=driving`}
                              target="_blank"
                              rel="noreferrer"
                              className="panel-action-link"
                            >
                              Route <ArrowUpRight size={13} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Quick Grid */}
                  <div className="quick-feature-grid">
                    <button className="feature-tile-btn" onClick={() => setActiveModal("qr")}>
                      <div className="feature-tile-top">
                        <div className="feature-tile-icon"><QrCode size={18} /></div>
                        <ChevronRight size={14} color="#64748B" />
                      </div>
                      <strong>{t("qrTitle")}</strong>
                      <small>{t("qrDescription")}</small>
                    </button>

                    <button className="feature-tile-btn" onClick={() => setActiveModal("report")}>
                      <div className="feature-tile-top">
                        <div className="feature-tile-icon"><ImagePlus size={18} /></div>
                        <ChevronRight size={14} color="#64748B" />
                      </div>
                      <strong>{t("reportTitle")}</strong>
                      <small>{t("reportDescription")}</small>
                    </button>

                    <button className="feature-tile-btn" onClick={() => setActiveModal("preparedness")}>
                      <div className="feature-tile-top">
                        <div className="feature-tile-icon"><Activity size={18} /></div>
                        <ChevronRight size={14} color="#64748B" />
                      </div>
                      <strong>{t("preparedness")}</strong>
                      <small>CPR, Arterial Bleeding & Burns</small>
                    </button>

                    <button className="feature-tile-btn" onClick={() => setActiveModal("checklist")}>
                      <div className="feature-tile-top">
                        <div className="feature-tile-icon"><Check size={18} /></div>
                        <ChevronRight size={14} color="#64748B" />
                      </div>
                      <strong>{t("checklist")}</strong>
                      <small>Home, vehicle & disaster kits</small>
                    </button>
                  </div>
                </div>

                {/* Right Column: AI Assistant Quick Dock & Volunteer Stream */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* AI Assistant Quick Panel */}
                  <div className="glass-panel ai-assistant-card">
                    <div className="panel-header-row">
                      <div className="panel-header-title">
                        <Bot size={20} color="#00D9FF" />
                        <h2>{t("aiAssistant")}</h2>
                      </div>
                      <span className="ai-header-badge"><Sparkles size={11} /> READY</span>
                    </div>

                    <div style={{ background: "rgba(11, 18, 32, 0.6)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)", minHeight: "90px" }}>
                      {dashAssistantReply ? (
                        <p style={{ fontSize: "0.85rem", color: "#F8FAFC", lineHeight: "1.45", whiteSpace: "pre-line" }}>
                          {dashAssistantReply}
                        </p>
                      ) : (
                        <p style={{ fontSize: "0.84rem", color: "#94A3B8" }}>
                          Ask for instant first-aid advice (CPR rate, severe bleeding, burns) or how to operate InjuryAI's emergency features.
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleDashAssistantSubmit} style={{ display: "flex", gap: "8px" }}>
                      <input
                        className="styled-input"
                        style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1 }}
                        value={dashAssistantQuestion}
                        onChange={(e) => setDashAssistantQuestion(e.target.value)}
                        placeholder="e.g. How to stop arterial bleeding?"
                        disabled={dashAssistantLoading}
                      />
                      <button
                        type="submit"
                        className="chat-submit-btn"
                        style={{ padding: "8px 14px" }}
                        disabled={dashAssistantLoading || !dashAssistantQuestion.trim()}
                      >
                        <Send size={15} />
                      </button>
                    </form>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => setActiveModal("assistant")} style={{ fontSize: "0.78rem", color: "#00D9FF", fontWeight: 600 }}>
                        Open Full Screen Chat →
                      </button>
                      <span style={{ fontSize: "0.7rem", color: "#64748B" }}>Non-diagnostic triage</span>
                    </div>
                  </div>

                  {/* Active Volunteers Preview */}
                  <div className="glass-panel">
                    <div className="panel-header-row">
                      <div className="panel-header-title">
                        <Users size={19} color="#22C55E" />
                        <h2>Available Volunteers</h2>
                      </div>
                      <button onClick={() => setActiveView("volunteers")} className="panel-action-link">
                        Portal <ArrowUpRight size={13} />
                      </button>
                    </div>

                    <div className="data-list-stack">
                      {volunteers.slice(0, 3).map((v) => (
                        <div key={v.id} className="data-row-card">
                          <div className="data-row-left">
                            <div className="data-icon-pill green">
                              <ShieldCheck size={18} />
                            </div>
                            <div className="data-text-col">
                              <strong>{v.name}</strong>
                              <small>{v.role} • {v.badge}</small>
                            </div>
                          </div>
                          <span className={`status-badge ${v.status === "available" ? "resolved" : "high"}`} style={{ fontSize: "0.68rem" }}>
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Emergency Activity Stream */}
                  <div className="glass-panel">
                    <div className="panel-header-row">
                      <div className="panel-header-title">
                        <Activity size={19} color="#EF3340" />
                        <h2>{t("activity")}</h2>
                      </div>
                      <button onClick={() => setActiveView("tracking")} className="panel-action-link">
                        Tracker <ArrowUpRight size={13} />
                      </button>
                    </div>

                    <div className="data-list-stack">
                      {emergencyRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="data-row-card" onClick={() => { setActiveTrackingId(req.id); setActiveView("tracking"); }} style={{ cursor: "pointer" }}>
                          <div className="data-row-left">
                            <div className="data-icon-pill red">
                              <ShieldAlert size={18} />
                            </div>
                            <div className="data-text-col">
                              <strong>{req.category} #{req.id}</strong>
                              <small>{req.description?.slice(0, 45)}...</small>
                            </div>
                          </div>
                          <span className="status-badge critical" style={{ fontSize: "0.68rem" }}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOSPITAL FINDER VIEW */}
          {activeView === "hospitals" && (
            <HospitalFinderView
              location={location}
              hospitals={allHospitalsList}
              onRefreshLocation={getCurrentLocation}
            />
          )}

          {/* VOLUNTEER NETWORK VIEW */}
          {activeView === "volunteers" && (
            <VolunteerNetworkView
              volunteers={volunteers}
              emergencyRequests={emergencyRequests}
              onRegisterVolunteer={handleRegisterVolunteer}
              onUpdateStatus={handleUpdateVolunteerStatus}
              onRespondToRequest={handleRespondToRequest}
            />
          )}

          {/* EMERGENCY TRACKER VIEW */}
          {activeView === "tracking" && (
            <EmergencyTrackerView
              requests={emergencyRequests}
              activeRequestId={activeTrackingId}
              onSelectRequest={setActiveTrackingId}
              onUpdateStatus={handleUpdateEmergencyStatus}
              onRefresh={loadAllPlatformData}
            />
          )}

          {/* FULL MAP VIEW */}
          {activeView === "map" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF" }}>Live Interactive Response Radar</h1>
                  <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>Telemetry overlays for user position, hospitals, emergency sites, and volunteer responders.</p>
                </div>
                <button onClick={getCurrentLocation} className="primary-action-btn" style={{ padding: "8px 16px" }}>
                  <LocateFixed size={16} /> Recenter on GPS
                </button>
              </div>

              <div style={{ height: "650px", borderRadius: "18px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                <MapView
                  location={location}
                  places={allHospitalsList}
                  emergencyRequests={emergencyRequests}
                  volunteers={volunteers}
                  userName="Current GPS Position"
                  height="100%"
                />
              </div>
            </div>
          )}

          {/* ADMIN COMMAND DASHBOARD */}
          {activeView === "admin" && (
            <AdminDashboardView
              stats={stats}
              volunteers={volunteers}
              emergencyRequests={emergencyRequests}
              hospitals={allHospitalsList}
              onVerifyVolunteer={handleVerifyVolunteer}
              onUpdateEmergencyStatus={handleUpdateEmergencyStatus}
              onAddHospital={handleAddHospital}
              onRefreshData={loadAllPlatformData}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Red Alert Modal */}
      {activeModal === "redAlert" && (
        <RedAlertModal
          location={location}
          contacts={contacts}
          onClose={() => setActiveModal("")}
          onAlertCreated={handleAlertCreated}
        />
      )}

      {/* 2. Full AI Assistant Modal */}
      {activeModal === "assistant" && (
        <AssistantModal
          onClose={() => setActiveModal("")}
          language={language}
        />
      )}

      {/* 3. Preparedness Guide */}
      {activeModal === "preparedness" && (
        <PreparednessGuideModal
          onClose={() => setActiveModal("")}
          language={language}
        />
      )}

      {/* 4. Emergency Checklist */}
      {activeModal === "checklist" && (
        <ChecklistModal
          onClose={() => setActiveModal("")}
        />
      )}

      {/* 5. Offline Numbers Guide */}
      {activeModal === "offline" && (
        <OfflineGuideModal
          onClose={() => setActiveModal("")}
        />
      )}

      {/* 6. Contacts Circle */}
      {activeModal === "contacts" && (
        <ContactsModal
          contacts={contacts}
          onAddContact={(c) => setContacts((prev) => [...prev, c])}
          onRemoveContact={(idx) => setContacts((prev) => prev.filter((_, i) => i !== idx))}
          onClose={() => setActiveModal("")}
        />
      )}

      {/* 7. QR Medical Profile Modal */}
      {activeModal === "qr" && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(""); }}>
          <div className="modal-content-card" role="dialog" aria-modal="true">
            <button className="modal-close-btn" onClick={() => setActiveModal("")}>
              <X size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(0, 217, 255, 0.15)", color: "#00D9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>QR Emergency Medical ID</h2>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Scannable emergency profile for first responders</span>
              </div>
            </div>

            {qrToken && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "16px", background: "#FFFFFF", borderRadius: "14px" }}>
                <QRCodeSVG value={qrUrl} size={150} level="M" />
                <span style={{ color: "#0B1220", fontSize: "0.78rem", fontWeight: 700 }}>
                  Scan to View Verified Emergency ID
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a href={qrUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#3478F6", fontWeight: 600 }}>
                    Preview Profile ↗
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEmergencyProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-input-group">
                <label>Full Name</label>
                <input
                  className="styled-input"
                  required
                  value={emergencyProfile.name}
                  onChange={(e) => setEmergencyProfile({ ...emergencyProfile, name: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-input-group">
                  <label>Blood Group</label>
                  <input
                    className="styled-input"
                    value={emergencyProfile.bloodGroup}
                    onChange={(e) => setEmergencyProfile({ ...emergencyProfile, bloodGroup: e.target.value })}
                    placeholder="e.g. O+, A-"
                  />
                </div>
                <div className="form-input-group">
                  <label>Emergency Phone</label>
                  <input
                    className="styled-input"
                    value={emergencyProfile.emergencyContactPhone}
                    onChange={(e) => setEmergencyProfile({ ...emergencyProfile, emergencyContactPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="form-input-group">
                <label>Known Allergies</label>
                <input
                  className="styled-input"
                  value={emergencyProfile.allergies}
                  onChange={(e) => setEmergencyProfile({ ...emergencyProfile, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Latex"
                />
              </div>
              <div className="form-input-group">
                <label>Medical Conditions</label>
                <input
                  className="styled-input"
                  value={emergencyProfile.conditions}
                  onChange={(e) => setEmergencyProfile({ ...emergencyProfile, conditions: e.target.value })}
                  placeholder="e.g. Asthma, Diabetes"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button type="button" className="hero-secondary-btn" onClick={() => setActiveModal("")}>
                  Close
                </button>
                <button type="submit" className="primary-action-btn">
                  Generate / Update QR ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Incident Report Modal */}
      {activeModal === "report" && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(""); }}>
          <div className="modal-content-card" role="dialog" aria-modal="true">
            <button className="modal-close-btn" onClick={() => setActiveModal("")}>
              <X size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.15)", color: "#F97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImagePlus size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>Incident & Hazard Report</h2>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Upload incident photo and GPS coordinates</span>
              </div>
            </div>

            {reportSent ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <Check size={44} color="#22C55E" style={{ margin: "0 auto 10px auto" }} />
                <h3 style={{ fontSize: "1.2rem", color: "#FFFFFF", fontWeight: 700 }}>Incident Report Logged</h3>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "4px" }}>
                  Incident details and telemetry safely uploaded to the platform store.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitIncidentReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-input-group">
                  <label>Incident Description</label>
                  <textarea
                    className="styled-textarea"
                    rows={4}
                    required
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe collision, vehicle blockage, hazards or road condition..."
                  />
                </div>
                <div className="form-input-group">
                  <label>Attach Evidence Photo (Optional, max 5 MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="styled-input"
                    onChange={(e) => setReportPhoto(e.target.files?.[0] || null)}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                  <button type="button" className="hero-secondary-btn" onClick={() => setActiveModal("")}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-action-btn">
                    Upload Incident Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
