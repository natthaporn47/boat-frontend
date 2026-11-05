import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import "./MapView.css";

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.trim();

// Configure the shared loader once, including when React StrictMode remounts.
if (apiKey) {
  setOptions({ key: apiKey, v: "weekly", language: "th", region: "TH" });
}

function MapView() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = mapRef.current;
    let cancelled = false;
    let map;

    async function initMap() {
      try {
        if (!apiKey) throw new Error("Missing map configuration");
        const { Map } = await importLibrary("maps");
        if (cancelled) return;

        map = new Map(container, {
          // Default viewing location until real GPS data is connected.
          center: { lat: 13.736421, lng: 100.537812 },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("ไม่สามารถโหลดแผนที่ได้ กรุณาตรวจสอบการเชื่อมต่อหรือการตั้งค่า Google Maps");
        setLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      map?.unbindAll();
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="map-view">
      <div className="map-view-canvas" ref={mapRef} aria-label="แผนที่การทำงาน" aria-busy={loading} />
      {(loading || error) && <p className="map-view-message" role={error ? "alert" : "status"}>{error || "กำลังโหลดแผนที่…"}</p>}
    </div>
  );
}

export default MapView;
