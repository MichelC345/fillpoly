import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import fillpoly from "./utils/fillpoly";

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
  const [selectedPolygonIndices, setSelectedPolygonIndices] = useState([]); // Track selected polygons
  const [fillColor, setFillColor] = useState("rgba(0, 150, 255, 0.5)"); // Default fill color
  const [strokeColor, setStrokeColor] = useState("yellow"); // Default edge color
  const [isDrawing, setIsDrawing] = useState(false); // Toggle drawing mode
  const [polygonCompleted, setPolygonCompleted] = useState(false); // Flag for completed polygon
  const [allPolygonsCompleted, setAllPolygonsCompleted] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawAllPolygons(ctx);
  }, [polygons, points, selectedPolygonIndices]);

  const redrawAllPolygons = (ctx) => {
    console.log("redesenhando");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas
    polygons.forEach((polygon, index) => {
      const isSelected = selectedPolygonIndices.includes(index);
      console.log("poligono", index, isSelected);
      drawPolygon(
        ctx,
        polygon.points,
        true,
        polygon.fillColor,
        polygon.strokeColor,
        isSelected
      ); // Redraw all completed polygons with selection effect
    });
    if (allPolygonsCompleted) {
      return;
    }
    //console.log("allpolycomplet", allPolygonsCompleted);
    drawPolygon(ctx, points, polygonCompleted, fillColor, strokeColor, false); // Draw the polygon being created
  };

  const deleteSelectedPolygons = () => {
    // Remove all polygons whose indices are in selectedPolygonIndices
    const updatedPolygons = polygons.filter(
      (polygon, index) => !selectedPolygonIndices.includes(index)
    );
    setAllPolygonsCompleted(true);
    setPolygons(updatedPolygons);
    setSelectedPolygonIndices([]); // Clear selection
  };


  const drawPolygon = (ctx, pointsArray, completed, fill, stroke, isSelected) => {
    if (pointsArray.length < 2) return;
    console.log("desenhando polígono", pointsArray, stroke);

    // Apply visual effects for selected polygon
    if (isSelected) {
      console.log("aplicando efeito");
      ctx.lineWidth = 10; // Thicker stroke for selected polygon
      ctx.strokeStyle = "red"; // Change the stroke color for selected polygon
      ctx.shadowBlur = 15; // Add shadow/glow effect
      ctx.shadowColor = "rgba(255, 0, 0, 0.8)"; // Glow color
    } else {
      console.log("sem efeitos");
      ctx.lineWidth = 5; // Normal stroke width
      ctx.strokeStyle = stroke; // Regular stroke color
      ctx.shadowBlur = 0; // No shadow for non-selected polygons
    }

    ctx.beginPath();
    ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

    for (let i = 1; i < pointsArray.length; i++) {
      ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
    }

    if (completed) {
      /*ctx.lineTo(pointsArray[0].x, pointsArray[0].y); // Close polygon
      ctx.fillStyle = fill;
      ctx.fill(); */
      ctx.lineTo(pointsArray[0].x, pointsArray[0].y);
      ctx.stroke();
      fillpoly(ctx, pointsArray, fill);
    }


    ctx.stroke();

    // Draw circles at each point and label them alphabetically
    pointsArray.forEach((point, index) => {
      drawPoint(ctx, point.x, point.y, index);
    });
  };

  const drawPoint = (ctx, x, y, index) => {
    const radius = 5; // Circle radius for each point
    const label = String.fromCharCode(65 + index); // Convert index to a letter (A, B, C...)

    // Draw the circle at the point
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red"; // Color for the point circle
    ctx.fill();
    ctx.stroke(); // Outline the circle

    // Draw the label next to the point
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(label, x + 8, y - 8); // Offset the label to appear next to the point
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is inside an existing polygon
    let clickedPolygonIndex = null;
    polygons.forEach((polygon, index) => {
      if (isPointInPolygon(x, y, polygon.points)) {
        console.log("ponto dentro", index);
        clickedPolygonIndex = index;
      }
    });

    if (clickedPolygonIndex !== null) {
      // A polygon is clicked, toggle its selection state
      if (selectedPolygonIndices.includes(clickedPolygonIndex)) {
        // If it's already selected, deselect it
        setSelectedPolygonIndices(
          selectedPolygonIndices.filter((i) => i !== clickedPolygonIndex)
        );
      } else {
        // Otherwise, select it
        setSelectedPolygonIndices([...selectedPolygonIndices, clickedPolygonIndex]);
      }
      console.log("selected polygons", selectedPolygonIndices);
    } else {
      // Add new point to the current polygon being drawn
      if (!isDrawing || polygonCompleted) return;

      if (points.length > 0) { //último vértice inserido perto do primeiro ponto, então o polígono estará completo
        const firstPoint = points[0];
        const dist = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
        if (dist < 10) {
          setIsDrawing(false); // Stop drawing
          setAllPolygonsCompleted(true);
          setPolygons([...polygons, { points: [...points], fillColor, strokeColor }]); // Save completed polygon with fill and stroke color
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
      setSelectedPolygonIndices([]); // Deselect all selected polygons
      setAllPolygonsCompleted(false);
    }
    setIsDrawing(true); // Enable drawing
  };

  const clearCanvas = () => {
    setPoints([]);
    setPolygons([]);
    setIsDrawing(false);
    setPolygonCompleted(false);
    setSelectedPolygonIndices([]);
    setAllPolygonsCompleted(false);
  };

  const changeFillColor = (e) => {
    const color = e.target.value;
    setFillColor(color);

    console.log("selected polygons", selectedPolygonIndices);
    // If any polygons are selected, update their fill color
    if (selectedPolygonIndices.length > 0) {
      const updatedPolygons = [...polygons];
      selectedPolygonIndices.forEach((index) => {
        updatedPolygons[index].fillColor = color;
      });
      setAllPolygonsCompleted(true);
      setPolygons(updatedPolygons);
    }
  };

  const changeStrokeColor = (e) => {
    const color = e.target.value;
    setStrokeColor(color);
    console.log("atualizando cor das arestas");

    // If any polygons are selected, update their stroke color
    if (selectedPolygonIndices.length > 0) {
      const updatedPolygons = [...polygons];
      selectedPolygonIndices.forEach((index) => {
        updatedPolygons[index].strokeColor = color;
      });
      setAllPolygonsCompleted(true);
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
        <button onClick={deleteSelectedPolygons}>Remover Selecionados</button>
        <div>
          <label>Fill Color:</label>
          <input type="color" value={fillColor} onChange={changeFillColor} />
        </div>
        <div>
          <label>Edge Color:</label>
          <input type="color" value={strokeColor} onChange={changeStrokeColor} />
        </div>
      </div>
    </div>
  );
};

export default App;
