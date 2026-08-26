/**
 * DIGIPIN Encoder and Decoder Library
 * Developed by India Post, Department of Posts
 * Released under an open-source license for public use
 *
 * TypeScript port — server-side only (`lib/digipin.ts`).
 * Never import this file from client components; call the
 * /api/digipin/* API routes instead so the algorithm stays
 * server-controlled and cannot be tampered with from the browser.
 *
 * Functions:
 *   getDigiPin(lat, lon)             → 10-char DIGIPIN string
 *   getLatLngFromDigiPin(digiPin)    → { latitude, longitude } (6 d.p.)
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 4×4 character grid used to encode each refinement level. */
const DIGIPIN_GRID: readonly (readonly string[])[] = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
] as const;

/** Geographic bounds covered by DIGIPIN (roughly the Indian subcontinent). */
const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5,
} as const;

/** Full set of valid DIGIPIN characters. */
const VALID_CHARS_RE = /^[23456789CFJKLMPT]{10}$/;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DigipinCoords {
  latitude: string;  // fixed to 6 decimal places
  longitude: string; // fixed to 6 decimal places
}

// ---------------------------------------------------------------------------
// Encoder
// ---------------------------------------------------------------------------

/**
 * Encodes a latitude/longitude pair into a 10-character DIGIPIN string.
 *
 * @param lat - Latitude  (must be within [2.5, 38.5])
 * @param lon - Longitude (must be within [63.5, 99.5])
 * @returns   10-character uppercase DIGIPIN, e.g. "4T396F42L7"
 * @throws    Error if coordinates are out of the supported bounds
 */
export function getDigiPin(lat: number, lon: number): string {
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat)
    throw new Error(`Latitude ${lat} is out of range [${BOUNDS.minLat}, ${BOUNDS.maxLat}]`);
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon)
    throw new Error(`Longitude ${lon} is out of range [${BOUNDS.minLon}, ${BOUNDS.maxLon}]`);

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let digiPin = "";

  for (let level = 1; level <= 10; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // Row index is reversed so that higher latitudes map to lower row indices
    let row = 3 - Math.floor((lat - minLat) / latDiv);
    let col = Math.floor((lon - minLon) / lonDiv);

    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    digiPin += DIGIPIN_GRID[row][col];

    // Narrow the bounding box for the next level
    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);
    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin.toUpperCase();
}

// ---------------------------------------------------------------------------
// Decoder
// ---------------------------------------------------------------------------

/**
 * Decodes a 10-character DIGIPIN back to the central lat/lon of its cell.
 *
 * @param digiPin - 10-char DIGIPIN string (case-insensitive, no separators)
 * @returns       { latitude, longitude } as strings fixed to 6 decimal places
 * @throws        Error if the input is invalid
 */
export function getLatLngFromDigiPin(digiPin: string): DigipinCoords {
  if (typeof digiPin !== "string")
    throw new Error("Invalid DIGIPIN: must be a string.");

  const pin = digiPin.trim().toUpperCase();

  if (pin.length !== 10)
    throw new Error("Invalid DIGIPIN: must be exactly 10 characters.");

  if (!VALID_CHARS_RE.test(pin))
    throw new Error(
      "Invalid DIGIPIN: only characters 2,3,4,5,6,7,8,9,C,F,J,K,L,M,P,T are allowed."
    );

  let minLat: number = BOUNDS.minLat;
  let maxLat: number = BOUNDS.maxLat;
  let minLon: number = BOUNDS.minLon;
  let maxLon: number = BOUNDS.maxLon;

  for (let i = 0; i < 10; i++) {
    const char = pin[i];
    let ri = -1;
    let ci = -1;
    let found = false;

    outer: for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break outer;
        }
      }
    }

    if (!found) throw new Error(`Invalid character "${char}" in DIGIPIN.`);

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  return {
    latitude: ((minLat + maxLat) / 2).toFixed(6),
    longitude: ((minLon + maxLon) / 2).toFixed(6),
  };
}
