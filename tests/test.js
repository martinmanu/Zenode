import { initializeCanvas, createShape} from "../dist/core/engine.js";
import defaultConfig from "../dist/config/defaultConfig.json" assert { type: "json" };

console.log("Running test...");

// Example Test Case
const canvas = initializeCanvas();
const shape = createShape( "circle", 100, 100, 'start');
// const connection = createConnection(shape, shape);

console.log("Canvas:", canvas);
console.log("Shape:", shape);
// console.log("Connection:", connection);
console.log("Test completed successfully!");
