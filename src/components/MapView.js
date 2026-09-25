import React, { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const API_KEY = "AIzaSyALzQkWIi-AbqfDIFgBKkuzkuYpmeSGaaI";

function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    async function initMap() {
      setOptions({
        key: API_KEY,
        v: "weekly",
      });

      const { Map } = await importLibrary("maps");

      new Map(mapRef.current, {
        center: {
          lat: 13.736421,
          lng: 100.537812,
        },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    initMap();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
      }}
    />
  );
}

export default MapView;