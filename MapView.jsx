import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MapView({
  location,
  places = [],
  emergencyRequests = [],
  volunteers = [],
  userName = "You",
  height = "100%"
}) {
  const center = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
    ? [location.latitude, location.longitude]
    : [37.7749, -122.4194];

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      >
        <RecenterMap center={center} />
        {/* OpenStreetMap CartoDB Dark Matter / Positron or Standard */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* User Location Marker */}
        {location && (
          <>
            <CircleMarker
              center={[location.latitude, location.longitude]}
              radius={22}
              pathOptions={{
                color: "#00D9FF",
                weight: 1.5,
                fillColor: "#00D9FF",
                fillOpacity: 0.18
              }}
            />
            <CircleMarker
              center={[location.latitude, location.longitude]}
              radius={9}
              pathOptions={{
                color: "#FFFFFF",
                weight: 3,
                fillColor: "#00D9FF",
                fillOpacity: 1
              }}
            >
              <Popup>
                <div style={{ color: "#0B1220", padding: "4px" }}>
                  <strong style={{ fontSize: "14px" }}>📍 {userName} (Current Position)</strong>
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* Nearby Hospitals & Clinics Markers */}
        {places.map((place) => (
          <CircleMarker
            key={place.id || `${place.latitude}-${place.longitude}`}
            center={[place.latitude, place.longitude]}
            radius={8}
            pathOptions={{
              color: "#FFFFFF",
              weight: 2,
              fillColor: place.emergency ? "#EF3340" : "#3478F6",
              fillOpacity: 0.95
            }}
          >
            <Popup>
              <div style={{ color: "#0B1220", minWidth: "170px", padding: "4px" }}>
                <strong style={{ fontSize: "13px", display: "block", color: "#0B1220" }}>
                  🏥 {place.name}
                </strong>
                <div style={{ fontSize: "11px", color: "#64748B", textTransform: "capitalize", margin: "2px 0 6px 0" }}>
                  {place.category?.replace("_", " ") || "Hospital"} {place.emergency ? "• 24/7 ER" : ""}
                </div>
                {place.phone && (
                  <div style={{ fontSize: "11px", color: "#0F172A", marginBottom: "6px" }}>
                    📞 {place.phone}
                  </div>
                )}
                {location && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${place.latitude},${place.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      background: "#3478F6",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      textDecoration: "none"
                    }}
                  >
                    Get Directions →
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Emergency Request Markers */}
        {emergencyRequests.map((req) => (
          <CircleMarker
            key={req.id}
            center={[req.latitude, req.longitude]}
            radius={10}
            pathOptions={{
              color: "#FFFFFF",
              weight: 2.5,
              fillColor: "#EF3340",
              fillOpacity: 1
            }}
          >
            <Popup>
              <div style={{ color: "#0B1220", minWidth: "180px", padding: "4px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#EF3340",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  ⚠️ ACTIVE ALERT ({req.priority})
                </span>
                <strong style={{ fontSize: "13px", display: "block", marginTop: "2px" }}>
                  {req.category} #{req.id}
                </strong>
                <p style={{ fontSize: "11px", color: "#475569", margin: "4px 0" }}>
                  {req.description || "Emergency assistance requested."}
                </p>
                <div style={{ fontSize: "10px", color: "#64748B" }}>
                  Status: <strong>{req.status?.toUpperCase()}</strong>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Verified Community Volunteers Markers */}
        {volunteers
          .filter((v) => v.status === "available" && v.latitude && v.longitude)
          .map((vol) => (
            <CircleMarker
              key={vol.id}
              center={[vol.latitude, vol.longitude]}
              radius={7}
              pathOptions={{
                color: "#FFFFFF",
                weight: 2,
                fillColor: "#22C55E",
                fillOpacity: 0.95
              }}
            >
              <Popup>
                <div style={{ color: "#0B1220", padding: "4px" }}>
                  <strong style={{ fontSize: "12px", display: "block" }}>
                    🛡️ {vol.name}
                  </strong>
                  <div style={{ fontSize: "11px", color: "#16A34A" }}>
                    {vol.role} • Available
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
                    ⭐ {vol.rating} • {vol.responsesCount} responses
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
