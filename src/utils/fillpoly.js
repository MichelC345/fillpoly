const fillpoly = (ctx, polygonPoints, fillColor, strokeColor) => {
    // Set fill style
    ctx.fillStyle = fillColor;

    // Get the Y-range of the polygon
    const minY = Math.min(...polygonPoints.map(point => point.y));
    const maxY = Math.max(...polygonPoints.map(point => point.y));

    // Scan through each Y-coordinate within the bounds of the polygon
    for (let y = minY; y <= maxY; y++) {
        let intersections = [];

        // Find intersections of the polygon with the current scanline
        for (let i = 0; i < polygonPoints.length; i++) {
            let j = (i + 1) % polygonPoints.length;
            const x1 = polygonPoints[i].x;
            const y1 = polygonPoints[i].y;
            const x2 = polygonPoints[j].x;
            const y2 = polygonPoints[j].y;

            // Check if the edge crosses the scanline
            if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
                const intersectX = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
                intersections.push(intersectX);
            }
        }

        // Sort intersections from left to right
        intersections.sort((a, b) => a - b);

        // Fill between pairs of intersections
        for (let i = 0; i < intersections.length; i += 2) {
            const startX = intersections[i];
            const endX = intersections[i + 1];

            // Fill the pixels between the intersections
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
    }
};

export default fillpoly;