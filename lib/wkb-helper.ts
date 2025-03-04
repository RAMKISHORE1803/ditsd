// lib/wkb-helper.ts
// Helper functions for parsing PostGIS Well-Known Binary (WKB) data

/**
 * Parse a PostGIS WKB hex string to extract coordinates
 * Based on the structure of PostGIS WKB format
 */
export function parseWKBPoint(wkbHex: string): [number, number] {
    try {
      // Remove "0101000020E6100000" prefix (SRID marker)
      const actualData = wkbHex.substring(18);
      
      // The rest is two doubles (8 bytes each) in little-endian
      // First 16 chars represent X coordinate, next 16 chars represent Y coordinate
      const xHex = actualData.substring(0, 16);
      const yHex = actualData.substring(16, 32);
      
      // Reverse the bytes (convert from little-endian)
      const xHexReversed = [];
      const yHexReversed = [];
      
      for (let i = 0; i < 16; i += 2) {
        xHexReversed.unshift(xHex.substring(i, i + 2));
        yHexReversed.unshift(yHex.substring(i, i + 2));
      }
      
      // Convert hex to binary, then to double
      const xBinary = parseInt(xHexReversed.join(''), 16);
      const yBinary = parseInt(yHexReversed.join(''), 16);
      
      // Use Float64Array to convert binary to double
      const xBuffer = new ArrayBuffer(8);
      const yBuffer = new ArrayBuffer(8);
      const xView = new DataView(xBuffer);
      const yView = new DataView(yBuffer);
      
      xView.setUint32(0, xBinary >>> 0, false);
      xView.setUint32(4, xBinary / Math.pow(2, 32) >>> 0, false);
      yView.setUint32(0, yBinary >>> 0, false);
      yView.setUint32(4, yBinary / Math.pow(2, 32) >>> 0, false);
      
      const x = xView.getFloat64(0, false);
      const y = yView.getFloat64(0, false);
      
      // Use this much simpler method that seems to work better for PostGIS WKB
      const buffer = new ArrayBuffer(wkbHex.length / 2);
      const view = new Uint8Array(buffer);
      
      for (let i = 0; i < wkbHex.length; i += 2) {
        view[i / 2] = parseInt(wkbHex.substring(i, i + 2), 16);
      }
      
      const dataView = new DataView(buffer);
      
      // PostGIS WKB format for a point with SRID:
      // 1 byte - endianness (1 = little endian)
      // 4 bytes - geometry type (1 = point, plus SRID flag)
      // 4 bytes - SRID value
      // 8 bytes - X coordinate
      // 8 bytes - Y coordinate
      const xCoord = dataView.getFloat64(9, true); // true = little-endian
      const yCoord = dataView.getFloat64(17, true);
      
      console.log(`WKB: ${wkbHex.substring(0, 30)}... => [${xCoord}, ${yCoord}]`);
      
      // Return [longitude, latitude]
      return [xCoord, yCoord];
    } catch (error) {
      console.error('Error parsing WKB point:', error, wkbHex);
      // Default to a location in Uganda if parsing fails
      return [32.58, 0.32]; // Default coordinates in Uganda
    }
  }
  
  // Function to test if a string looks like a WKB hex string
  export function isWKBHex(str: string): boolean {
    // WKB hex typically starts with 01010000 for points
    return /^0101000020E6100000/i.test(str);
  }
  
  // Function to create a simple icon based on tower type
  export function getTowerStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50'; // Green
      case 'maintenance':
        return '#FFC107'; // Yellow/Amber
      case 'planned':
        return '#2196F3'; // Blue
      case 'inactive':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }
  
  // Function to get coverage circle color based on connection type
  export function getConnectionTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case '5g':
        return '#9C27B0'; // Purple
      case '4g':
        return '#2196F3'; // Blue
      case '3g':
        return '#FF9800'; // Orange
      default:
        return '#607D8B'; // Blue Grey
    }
  }