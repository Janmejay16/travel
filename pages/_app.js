import { useState, useEffect, createContext, useContext } from 'react';
import '../styles/main.scss'
import AppContext from '../components/AppContext';
import Graph from '../components/Graph'

function MyApp({ Component, pageProps }) {
  const [graph, setgraph] = useState(null)
  const [ctx, setctx] = useState(null)
  const [canvas, setcanvas] = useState(null)
  // Define the vertices
  const vertices = ['A','B','C','D','E','F','G','H','I','J']
  
  // Allocate coordinates of the points in the Canvas element
  // [X coordinate, Y coordinate]
  const nodes = {
    'A': [10, 290],
    'B': [10, 50],
    'C': [170, 45],
    'D': [320, 5],
    'E': [410, 20],
    'F': [390, 120],
    'G': [520, 230],
    'H': [410, 320],
    'I': [230, 210],
    'J': [240, 105]
  }

  // Call the dijkstra algorithm based on distance
  const findRouteShort = () => {
    ctx.lineWidth = '4';
    var route = graph.DijkstraDistance(pickup.value, destination.value);
    drawRoute(route, "#888");
  }

  // Call the dijkstra algorithm based on time
  const findRouteFast = () => {
      ctx.lineWidth = '2';
      var route = graph.DijkstraFast(pickup.value, destination.value);
      drawRoute(route, "#000");
  }
  

  // FUnctions for plotting the path and map
  // -------------------------------------------------------------------------------------------------
  // Helper function for plotting the route
  function getVectorFromTwoPoints(point1, point2) {
    return {
        x: point2[0] - point1[0],
        y: point2[1] - point1[1],
    };
  }

  // Helper function for plotting the route
  function getDistanceBetweenPoints(point1, point2) {
      const x = point1[0] - point2[0];
      const y = point1[1] - point2[1];

      return Math.sqrt(x * x + y * y);
  }
  // Animation constants 
  const FRAME_DURATION = 1000 / 60; // 60fps frame duration ~16.66ms
  const getTime = typeof performance === 'function' ? performance.now : Date.now;
  // Global requestAnimationFrame ID so we can cancel it when user clicks on "Draw again"
  var rafID;
  // Function to animate line drawing
  function drawLine(startPoint, endPoint, drawingSpeed = 5, onAnimationEnd, startingLength = 0) {
    var lastUpdate = getTime();
    
    // Set initial state
    var currentPoint = startPoint;
    var vector = getVectorFromTwoPoints(startPoint, endPoint);
    var startToEndDistance = getDistanceBetweenPoints(startPoint, endPoint);

    const lineStep = drawingSpeed / startToEndDistance;
    const vectorStep = {
      x: vector.x * lineStep,
      y: vector.y * lineStep,
    };

    const animate = () => {
      const now = getTime();
      const delta = (now - lastUpdate) / FRAME_DURATION;
  
      const deltaVector = {
        x: vectorStep.x * delta,
        y: vectorStep.y * delta,
      };
      // Add starting length if any
      if (startingLength) {
        const startingLengthFactor = startingLength / startToEndDistance;    
        
        deltaVector.x += vector.x * startingLengthFactor;
        deltaVector.y += vector.y * startingLengthFactor;
        
        // We've drawn it once, we don't want to draw it again
        startingLength = 0;
      }
  
      // Set next point
      let nextPoint = [
        currentPoint[0] + deltaVector.x,
        currentPoint[1] + deltaVector.y
      ];
      
      let newStartingLength = 0;
      let isFinished = false;
      const startToNextPointDistance = getDistanceBetweenPoints(startPoint, nextPoint);
  
      // The next point is past the end point
      if (startToNextPointDistance >= startToEndDistance) {
        newStartingLength = startToNextPointDistance - startToEndDistance;
        isFinished = true;
        nextPoint = endPoint;
      }
      // Draw line segment
      ctx.beginPath();
      ctx.moveTo(currentPoint[0], currentPoint[1]);
      ctx.lineTo(nextPoint[0], nextPoint[1]);
      ctx.stroke();
  
      if (isFinished) {
        if (onAnimationEnd) {    
          onAnimationEnd(newStartingLength);
        }
        return;
      }
  
      // Move current point to the end of the drawn segment
      currentPoint = nextPoint;
  
      // Update last updated time
      lastUpdate = now;
      
      // Store requestAnimationFrame ID so we can cancel it
      rafID = requestAnimationFrame(animate);
    };
    // Start animation
    animate();
  } 

  function drawPolygon(vertices, drawingSpeed = 5, onAnimationEnd, startingLength = 0, startingPointIndex = 0) {
      const start = vertices[startingPointIndex];
      const end = vertices[startingPointIndex + 1];

      if (startingPointIndex + 1 >= vertices.length) {
      if (onAnimationEnd) {
          onAnimationEnd();
      }
      return;
      }

      drawLine(nodes[`${start}`], nodes[`${end}`], drawingSpeed, (startingLength) => {
      const newIndex = startingPointIndex + 1;
      drawPolygon(vertices, drawingSpeed, onAnimationEnd, startingLength, newIndex)
      }, startingLength);
  }

  function drawRoute(route, color="#aaa") {
      ctx.strokeStyle = color;
      // Cancel previous animation
      cancelAnimationFrame(rafID);
      
      // Draw polygon
      drawPolygon(route, 5, () => {});
  }
  // -------------------------------------------------------------------------------------------------
    
  useEffect(() => {
      var canvas = document.getElementById('canvas')
      setcanvas(canvas)
      setctx(canvas.getContext('2d'));
  }, [])
  
  useEffect(() => {
    var graph = new Graph();
    // Add vertices/nodes in the graph
    graph.addVertex("A");
    graph.addVertex("B");
    graph.addVertex("C");
    graph.addVertex("D");
    graph.addVertex("E");
    graph.addVertex("F");
    graph.addVertex("G");
    graph.addVertex("H");
    graph.addVertex("I");
    graph.addVertex("J");

    
    // "Graph.addEgde" method Params: (vertex1, vertex2, distance, time)
    /* You can change the distances and time values
    to verify the working of the algorithm */
    graph.addEdge('A','B',10, 1.0)
    graph.addEdge('A','I',13, 0.3)
    graph.addEdge('B','C',5, .5)
    graph.addEdge('B','J',12, 1.2)
    graph.addEdge('C','D',7, .7)
    graph.addEdge('C','J',2, 10.2)
    graph.addEdge('D','E',5, .5)
    graph.addEdge('D','F',9, .9)
    graph.addEdge('E','F',6, .6)
    graph.addEdge('F','G',7, 6.7)
    graph.addEdge('F','J',11, 5.1)
    graph.addEdge('G','I',14, 8.4)
    graph.addEdge('H','I',16, 1.6)
    graph.addEdge('I','J',13, .3)

    // Set the state varaible
    setgraph(graph)
  }, [])

  return (
    // Context for global state variables management
    <AppContext.Provider value={{
      graph, nodes, vertices,
      canvas, ctx,
      findRouteShort, findRouteFast
    }}>
      <Component {...pageProps} />
    </AppContext.Provider>
  )
}

export default MyApp
