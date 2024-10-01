import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// Helper function: Check if a point is inside a polygon using ray-casting algorithm
function isPointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}


const App = () => {
  const [points, setPoints] = useState([]); // Current points for the polygon
  const [polygons, setPolygons] = useState([]); // Store all completed polygons
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(null); // Track selected polygon
  const [fillColor, setFillColor] = useState("rgba(0, 150, 255, 0.5)"); // Default fill color
  const [isDrawing, setIsDrawing] = useState(false); // Toggle drawing mode
  const [polygonCompleted, setPolygonCompleted] = useState(false); // Flag for completed polygon

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawAllPolygons(ctx);
  }, [polygons, points]);

  const redrawAllPolygons = (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas
    polygons.forEach((polygon, index) => drawPolygon(ctx, polygon.points, true, index === selectedPolygonIndex ? "rgba(255, 255, 0, 0.5)" : polygon.fillColor)); // Redraw all completed polygons
    drawPolygon(ctx, points, polygonCompleted, fillColor); // Draw the polygon being created
  };

  const drawPolygon = (ctx, pointsArray, completed, color) => {
    if (pointsArray.length < 2) return;

    ctx.beginPath();
    console.log("draw polygon", pointsArray[0], pointsArray);
    ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

    for (let i = 1; i < pointsArray.length; i++) {
      ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
    }

    if (completed) {
      console.log("completando polígono", pointsArray);
      ctx.lineTo(pointsArray[0].x, pointsArray[0].y); // Close polygon
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.stroke();
  };

  const handleCanvasClick = (event) => {
    //if (!isDrawing || polygonCompleted) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is inside an existing polygon
    let selectedIndex = null;
    polygons.forEach((polygon, index) => {
      if (isPointInPolygon(x, y, polygon.points)) {
        selectedIndex = index;
      }
    });

    console.log("selectedIndex", selectedIndex);
    if (selectedIndex !== null) {
      // A polygon is selected
      setSelectedPolygonIndex(selectedIndex);
    } else {
      // Add new point to the current polygon being drawn
      if (!isDrawing || polygonCompleted) return;

      if (points.length > 0) {
        const firstPoint = points[0];
        const dist = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
        if (dist < 10) {
          setIsDrawing(false); // Stop drawing
          setPolygons([...polygons, { points: [...points], color: fillColor }]); // Save completed polygon with fill color
          setPolygonCompleted(true);
          return;
        }
      }

      setPoints([...points, { x, y }]); // Add new point to current polygon
    }
  };

  const startDrawing = () => {
    if (polygonCompleted) {
      setPoints([]); // Reset points for new polygon
      setPolygonCompleted(false);
      setSelectedPolygonIndex(null); // Deselect any selected polygon
    }
    setIsDrawing(true); // Enable drawing
  };

  const clearCanvas = () => {
    setPoints([]);
    setPolygons([]);
    setIsDrawing(false);
    setPolygonCompleted(false);
    setSelectedPolygonIndex(null);
  };

  const changeFillColor = (e) => {
    const color = e.target.value;
    setFillColor(color);

    // If a polygon is selected, update its fill color
    if (selectedPolygonIndex !== null) {
      const updatedPolygons = [...polygons];
      updatedPolygons[selectedPolygonIndex].fillColor = color;
      setPolygons(updatedPolygons);
    }
  };

  return (
    <div>
      <h2>Click to draw a polygon</h2>
      <canvas
        id="polygonCanvas"
        ref={canvasRef}
        width={1024}
        height={768}
        onClick={handleCanvasClick}
      />
      <div>
        <button onClick={startDrawing}>Desenhar Polígono</button>
        <button onClick={clearCanvas}>Limpar</button>
        <input
          type="color"
          value={fillColor}
          onChange={changeFillColor}
        />
      </div>
    </div>
  );
};

export default App;
