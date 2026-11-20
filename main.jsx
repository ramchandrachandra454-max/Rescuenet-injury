import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import EmergencyProfile from "./EmergencyProfile.jsx";
import SharedLocation from "./SharedLocation.jsx";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const shareMatch = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]{20,64})$/);
const profileMatch = window.location.pathname.match(/^\/emergency\/([A-Za-z0-9_-]{20,64})$/);
const Page = shareMatch
  ? () => <SharedLocation token={shareMatch[1]} />
  : profileMatch
    ? () => <EmergencyProfile token={profileMatch[1]} />
    : App;

createRoot(document.getElementById("root")).render(<React.StrictMode><Page /></React.StrictMode>);
