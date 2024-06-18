import MapComponent from "./components/Map";

function App() {
  return (
    <div className="App">
      <div className="App text-center">
        <h1 className="text-3xl font-bold my-4">GeoVis Lite</h1>
        <div className="mb-3">
          <em>A simple app for visualising geometries</em>
        </div>
        <MapComponent />
      </div>
    </div>
  );
}

export default App;
