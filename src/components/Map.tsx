import React, { useState, useEffect } from "react";
import "ol/ol.css";
import { Feature, Map as OLMap, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Style, Stroke } from "ol/style";
import { GeoJSON } from "ol/format";
import WKT from "ol/format/WKT";

const MapComponent: React.FC = () => {
  const [map, setMap] = useState<OLMap | null>(null);
  const [vectorSource, setVectorSource] = useState(new VectorSource());
  const [projection, setProjection] = useState("EPSG:4326");
  const [format, setFormat] = useState<"WKT" | "GEOJSON">("WKT");
  const [error, setError] = useState<null | string>(null);
  const [osmLayer, setOsmLayer] = useState(
    new TileLayer({ source: new OSM() })
  );
  const [osmVisible, setOsmVisible] = useState(true);

  useEffect(() => {
    const initialMap = new OLMap({
      target: "map",
      layers: [
        osmLayer,
        new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({
              color: "#ffcc33",
              width: 2,
            }),
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(initialMap);

    return () => {
      if (initialMap) initialMap.setTarget(undefined);
    };
  }, [vectorSource]);

  const handleGeometryInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setError(null);
    const reader = format === "WKT" ? new WKT() : new GeoJSON();
    try {
      const feature = new Feature(
        reader.readGeometry(e.target.value, {
          dataProjection: projection,
          featureProjection: "EPSG:3857",
        })
      );
      vectorSource.clear();
      vectorSource.addFeature(feature);
    } catch (err) {
      setError("Inalid " + format);
      console.error(`Invalid ${format} format`, err);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as any);
  };

  const zoom = () => {
    map?.getView().fit(vectorSource.getExtent());
  };

  const toggleOsmVisibility = () => {
    setOsmVisible((prev) => {
      osmLayer.setVisible(!prev);
      return !prev;
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 w-full max-w-xl">
        <div className="flex justify-start">
          <label
            htmlFor="formatSelect"
            className="text-start text-sm italic mb-1"
          >
            Format
          </label>
        </div>

        <select
          id="formatSelect"
          onChange={handleFormatChange}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="WKT">WKT</option>
          <option value="GEOJSON">GeoJSON</option>
        </select>

        <div className="flex justify-start">
          <label
            htmlFor="geometryInput"
            className="text-start text-sm italic mb-1"
          >
            Geometry
          </label>
        </div>
        <div className="mb-1">
          <textarea
            id="geometryInput"
            className={`w-full p-2 border rounded ${error && "border-red-300"}`}
            placeholder={`Enter ${format === "WKT" ? "WKT" : "GeoJSON"}`}
            onChange={handleGeometryInputChange}
            rows={4}
          />
          {error && (
            <div className="text-start text-sm text-red-300">{error}</div>
          )}
        </div>

        <div className="flex justify-start">
          <label
            htmlFor="projectionInput"
            className="text-start text-sm italic mb-1"
          >
            Projection:
          </label>
        </div>
        <input
          id="projectionInput"
          className="w-full p-2 mb-2 border rounded"
          type="text"
          placeholder="Enter Projection (e.g., EPSG:4326)"
          value={projection}
          onChange={(e) => setProjection(e.target.value)}
        />
      </div>
      <div className="mb-4 w-full max-w-xl">
        <button
          disabled={!!error}
          className="btn btn-blue w-full max-w-x"
          onClick={zoom}
        >
          Zoom to feature
        </button>
      </div>
      <div
        id="map"
        className="w-full max-w-xl h-96 border border-gray-300"
        role="region"
        aria-label="map"
      ></div>

      <div className="text-start flex justify-start items-start mt-2 w-full max-w-xl">
        <label className="inline-flex items-start cursor-pointer">
          <span className="me-3 mt-[2px] text-sm font-medium">
            Show OSM base layer
          </span>
          <input
            type="checkbox"
            value=""
            checked={osmVisible}
            onClick={toggleOsmVisibility}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-blue-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};

export default MapComponent;
