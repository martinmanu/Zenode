export interface Shape {
    id: string;               // Unique identifier for the shape variant
    position?: { x: number; y: number }; // Where to place the shape on the canvas
    // For circle:
    radius?: number;
    // For rectangle (and similar shapes):
    width?: number;
    height?: number;
    borderRadius?: {         // For rounded corners (if applicable)
      leftTop?: number;
      leftBottom?: number;
      rightTop?: number;
      rightBottom?: number;
    };
    // Styling properties
    color: string;            // Fill color
    stroke: {
      width: number;
      color: string;
      strokeType: string;
      strokeDasharray: number[];
    };
    // Optional properties for inner text
    text?: string;
    textColor?: string;
    transparency: number;
    // Optional properties for icons or images (can be SVG markup, image URL, etc.)
    icon?: string;            // e.g., an SVG snippet or a URL to an icon image
    // Optional: additional properties like boxShadow, etc.
    boxShadow?: string;
  }
  
