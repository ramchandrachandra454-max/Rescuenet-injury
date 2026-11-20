# InjuryAI — Premium AI-Powered Emergency Response & Smart Assistance Platform

> **Tagline:** Smart Help. Faster Response. Safer Lives.

InjuryAI is a modern, production-grade emergency technology and smart first-responder web application. It combines instant bystander emergency dispatch, verified community first responders (EMTs, doctors, CPR certified citizens), real-time interactive mapping, certified trauma facility finder, evidence-based AI assistance, and an administrative mission command center.

---

## 🌟 Key Capabilities

### 1. High-Priority RED ALERT SOS System
- **Single-Tap or Hold SOS Broadcast:** Transmits exact GPS coordinates and emergency category (Accident, Severe Injury, Medical Crisis, Fire / Hazard, Road Emergency).
- **Zero-Latency Dispatch:** Alerts are immediately written to the database with cryptographic audit logging. Only confirmed after server verification.
- **Automated Circle Notification:** Broadcasts emergency tracking links to designated trusted contacts.
- **Live Response Countdown & Audio Beacons:** Auditory siren tone generated via the Web Audio API for sensory feedback.
- **Safe Test Mode:** Built-in simulation mode to verify end-to-end telemetry without alerting live responders.

### 2. Live Interactive Response Radar (Mapping System)
- **Real-Time Leaflet & OpenStreetMap Integration:** Visualizes the victim's location with glowing pulse radius.
- **Overpass & OpenStreetMap Live Healthcare Telemetry:** Live queries for hospitals, 24/7 ER departments, and urgent care clinics within a 9 km radius.
- **Verified Fallback Facility Registry:** Pre-seeded trauma centers ensure mapping is never empty even outside API coverage.
- **Volunteer Marker Telemetry:** Shows verified volunteer responders when sharing is active.
- **One-Tap Driving Directions:** Integrates with Google Maps Navigation with automatic travel time estimations.

### 3. InjuryAI Smart AI Assistant
- **Evidence-Based First-Aid Knowledge Engine:** Clinical protocols for Adult CPR (100–120 bpm), severe arterial bleeding, burn management, Heimlich maneuver, suspected myocardial infarction, and bone fractures.
- **Gemini API Integration:** Ready to connect to Google Gemini 1.5/2.0 (`GEMINI_API_KEY`).
- **Graceful Offline/Demo Fallback:** Full support for multi-lingual clinical triage even when API keys are not provided.
- **Voice Recognition & Speech Output:** Hands-free speech-to-text input and "Read Aloud" speech synthesis for urgent bystander guidance.
- **Strict Safety Guardrails:** Clear, prominent disclaimers that AI does not diagnose conditions or replace official municipal emergency services (911 / 112).

### 4. Certified Hospital & Trauma Finder
- Search and filter by 24/7 Emergency Rooms, Trauma Centers, and Urgent Care clinics.
- Distance calculation in miles and estimated driving minutes.
- Direct-dial telephone buttons (`tel:`) and GPS directions.

### 5. Community Volunteer First-Responder Network
- Volunteer registration with CPR and First Aid certifications.
- Real-time availability toggle: **Available (Online)**, **Busy**, and **Offline**.
- Responder assignment workflow: Volunteers can accept emergency calls, mark themselves *En Route*, *On Scene*, and *Resolved*.
- Verification badges for Paramedics, EMTs, Medical Doctors, and Certified Citizens.

### 6. Live Emergency Request Tracker
- Dedicated tracking page with live status updates.
- Visual milestone tracker: `Created` → `Acknowledged` → `En Route` → `On Scene` → `Resolved`.
- Assigned responder details, phone coordination, and emergency cancellation options.

### 7. Admin Mission Command Center
- Protected with role-based passcode authentication (`admin123`).
- Live platform analytics: Total requests, active alerts, resolved cases, and available EMTs.
- Volunteer verification approval/revocation tools.
- Emergency case manager and hospital registry tools.
- Real-time system health and cryptographic audit logs.

### 8. Additional Innovative Tools
- **QR Medical ID:** Creates a scannable QR code linking to a standalone `/emergency/:token` profile for paramedics.
- **Expiring GPS Location Sharing:** Creates a private 1-hour live tracking URL (`/share/:token`).
- **Emergency Preparedness Guides:** Illustrated step-by-step first-aid manuals.
- **Emergency Supplies Checklist:** Interactive readiness checklist with persistence.
- **Offline Emergency Directory:** Direct numbers for India (112), USA/Canada (911), UK (999), EU (112), and Australia (000).
- **Incident & Hazard Photo Upload:** Upload road hazard and accident photos with GPS tags.
- **Multilingual Support:** English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).
- **Accessibility Mode:** High-contrast visuals, enlarged text targets, and screen reader / speech narration.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons, React-Leaflet, Leaflet, QRCode.react, Modern CSS Variables & Glassmorphism Design Tokens.
- **Backend:** Node.js, Express 4, Multer (multipart photo uploads), Crypto.
- **Database & Storage:**
  - **Memory Store:** High-performance in-memory database with realistic seed data for zero-config demo / hackathon use.
  - **Firebase Cloud Firestore & Storage:** Enterprise cloud persistence when `FIREBASE_PROJECT_ID` is supplied.
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with built-in clinical triage fallback engine.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v20 & v26)
- npm or pnpm

### 2. Installation
```bash
# Clone or navigate to the project directory
cd RescueNet

# Install dependencies
npm install
```

### 3. Configuration (.env)
Copy the example environment file:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend API port | `5000` |
| `ADMIN_PASSCODE` | Passcode for Admin Command Center | `admin123` |
| `GEMINI_API_KEY` | Optional Google Gemini API key | Blank (uses built-in triage) |
| `FIREBASE_PROJECT_ID` | Optional Firebase project ID | Blank (uses demo memory store) |
| `FIREBASE_STORAGE_BUCKET` | Optional Firebase storage bucket | Blank |

### 4. Running the Application
To run both the backend server and frontend development server simultaneously:
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### 5. Running Automated Tests
```bash
npm test
```
Executes all 13 end-to-end integration tests over IPC, verifying health, real stats, Red Alert creation, volunteer dispatch, AI triage, and audit logging.

### 6. Production Build
```bash
npm run build
```

---

## 🔒 Security & Privacy Notice
1. **Consent-Based Location:** Coordinates are only captured upon user action (toggling GPS, activating Red Alert, or starting location sharing).
2. **Ephemeral Sharing:** Live location links automatically expire after 1 hour or when terminated by the user.
3. **Medical Disclaimer:** InjuryAI provides immediate community first-aid coordination and is designed to supplement, not replace, certified emergency medical services (911 / 112).
