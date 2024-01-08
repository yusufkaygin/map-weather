import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import turkeyGeoData from "./turkeyGeo.json";
import citiesCode from "./citiesCode.json";

function App() {
  const baseUrl = "https://dataservice.accuweather.com/currentconditions/v1";
  const apiKey = "******";

  const [cityData, setCityData] = useState(null);

  useEffect(() => {
    let data = {};
    const getCityWeather = (city) => {
      const apiUrl = `${baseUrl}/${city.code}?apikey=${apiKey}`;

      return fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const [weather] = data;
          return {
            [city.name]: weather.Temperature.Metric.Value,
          };
        })
        .catch((error) => console.log(error));
    };

    Promise.all(citiesCode.map((city) => getCityWeather(city)))
      .then((info) => {
        info.map((city) => {
          data = { ...data, ...city };
        });

        setCityData(data);
      })
      .catch((error) => console.log(error));
  }, []);

  function getColor(temp) {
    return temp >= 30
      ? "#FF2400"
      : temp >= 25
      ? "#FF6600"
      : temp >= 20
      ? "#FFA500"
      : temp >= 15
      ? "#FFC300"
      : temp >= 10
      ? "#FFFF66"
      : temp >= 5
      ? "#66CCCC"
      : temp >= 0
      ? "#3399FF"
      : "#6495ED";
  }

  return (
    <MapContainer
      center={[39.9199, 32.8543]}
      zoom={6}
      style={{ height: "97vh" }}
    >
      <TileLayer url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />

      {cityData && (
        <GeoJSON
          style={(feature) => {
            const cityName = feature.properties.name;
            const temp = cityData[cityName];

            return {
              fillColor: getColor(temp),
              fillOpacity: 0.7,
              weight: 1,
              color: "#333",
              dashArray: "3",
            };
          }}
          data={turkeyGeoData}
          onEachFeature={(feature, layer) => {
            const cityName = feature.properties.name;
            const coords = layer.getBounds().getCenter();

            const cityTemp = cityData[cityName];
            const popupContent = `${cityName}: ${cityTemp}°C`;

            layer.bindPopup(popupContent).on("click", () => {
              layer.openPopup(coords);
            });
          }}
        />
      )}
    </MapContainer>
  );
}

export default App;
