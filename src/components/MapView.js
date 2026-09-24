import React from "react";

import {
  MapContainer,
  TileLayer,
  LayersControl
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


const { BaseLayer } = LayersControl;


function MapView(){

  return (

    <MapContainer
      center={[13.736421,100.537812]}
      zoom={16}
      style={{
        width:"100%",
        height:"500px"
      }}
    >

      <LayersControl position="topright">


        {/* แผนที่ปกติ */}
        <BaseLayer checked name="แผนที่">

          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        </BaseLayer>



        {/* ดาวเทียม */}
        <BaseLayer name="ดาวเทียม">

          <TileLayer

            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

          />

        </BaseLayer>


      </LayersControl>


    </MapContainer>

  );

}


export default MapView;