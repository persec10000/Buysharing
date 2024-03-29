// Default geohash length
const g_GEOHASH_PRECISION = 10;

// Characters used in location geohashes
const g_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

// The meridional circumference of the earth in meters
const g_EARTH_MERI_CIRCUMFERENCE = 40007860;

// Length of a degree latitude at the equator
const g_METERS_PER_DEGREE_LATITUDE = 110574;

// Number of bits per geohash character
const g_BITS_PER_CHAR = 5;

// Maximum length of a geohash in bits
const g_MAXIMUM_BITS_PRECISION = 22 * g_BITS_PER_CHAR;

// Equatorial radius of the earth in meters
const g_EARTH_EQ_RADIUS = 6378137.0;

// The following value assumes a polar radius of
// var g_EARTH_POL_RADIUS = 6356752.3;
// The formulate to calculate g_E2 is
// g_E2 == (g_EARTH_EQ_RADIUS^2-g_EARTH_POL_RADIUS^2)/(g_EARTH_EQ_RADIUS^2)
// The exact value is used here to avoid rounding errors
const g_E2 = 0.00669447819799;

// Cutoff for rounding errors on double calculations
const g_EPSILON = 1e-12;

Math.log2 =
  Math.log2 ||
  function(x) {
    return Math.log(x) / Math.log(2);
  };

/**
 * Validates the inputted key and throws an error if it is invalid.
 *
 * @param {string} key The key to be verified.
 */
const validateKey = function(key) {
  let error;

  if (typeof key !== 'string') {
    error = 'key must be a string';
  } else if (key.length === 0) {
    error = 'key cannot be the empty string';
  } else if (1 + g_GEOHASH_PRECISION + key.length > 755) {
    // Firebase can only stored child paths up to 768 characters
    // The child path for this key is at the least: "i/<geohash>key"
    error = 'key is too long to be stored in Firebase';
  } else if (/[\[\].#$\/\u0000-\u001F\u007F]/.test(key)) {
    // Firebase does not allow node keys to contain the following characters
    error = 'key cannot contain any of the following characters: . # $ ] [ /';
  }

  if (typeof error !== 'undefined') {
    throw new Error("Invalid GeoFire key '" + key + "': " + error);
  }
};

/**
 * Validates the inputted location and throws an error if it is invalid.
 *
 * @param {Array.<number>} location The [latitude, longitude] pair to be verified.
 */
const validateLocation = function(location) {
  let error;

  if (!Array.isArray(location)) {
    error = 'location must be an array';
  } else if (location.length !== 2) {
    error = 'expected array of length 2, got length ' + location.length;
  } else {
    let latitude = location[0];
    let longitude = location[1];

    if (typeof latitude !== 'number' || isNaN(latitude)) {
      error = 'latitude must be a number';
    } else if (latitude < -90 || latitude > 90) {
      error = 'latitude must be within the range [-90, 90]';
    } else if (typeof longitude !== 'number' || isNaN(longitude)) {
      error = 'longitude must be a number';
    } else if (longitude < -180 || longitude > 180) {
      error = 'longitude must be within the range [-180, 180]';
    }
  }

  if (typeof error !== 'undefined') {
    throw new Error("Invalid GeoFire location '" + location + "': " + error);
  }
};

/**
 * Validates the inputted geohash and throws an error if it is invalid.
 *
 * @param {string} geohash The geohash to be validated.
 */
const validateGeohash = function(geohash) {
  let error;

  if (typeof geohash !== 'string') {
    error = 'geohash must be a string';
  } else if (geohash.length === 0) {
    error = 'geohash cannot be the empty string';
  } else {
    let i = 0;
    const length = geohash.length;
    for (; i < length; ++i) {
      if (g_BASE32.indexOf(geohash[i]) === -1) {
        error = 'geohash cannot contain "' + geohash[i] + '"';
      }
    }
  }

  if (typeof error !== 'undefined') {
    throw new Error("Invalid GeoFire geohash '" + geohash + "': " + error);
  }
};

/**
 * Validates the inputted query criteria and throws an error if it is invalid.
 *
 * @param {Object} newQueryCriteria The criteria which specifies the query's center and/or radius.
 */
const validateCriteria = function(newQueryCriteria, requireCenterAndRadius) {
  if (typeof newQueryCriteria !== 'object') {
    throw new Error('query criteria must be an object');
  } else if (
    typeof newQueryCriteria.center === 'undefined' &&
    typeof newQueryCriteria.radius === 'undefined'
  ) {
    throw new Error('radius and/or center must be specified');
  } else if (
    requireCenterAndRadius &&
    (typeof newQueryCriteria.center === 'undefined' ||
      typeof newQueryCriteria.radius === 'undefined')
  ) {
    throw new Error(
      'query criteria for a new query must contain both a center and a radius',
    );
  }

  // Throw an error if there are any extraneous attributes
  const keys = Object.keys(newQueryCriteria);
  const numKeys = keys.length;
  for (let i = 0; i < numKeys; ++i) {
    const key = keys[i];
    if (key !== 'center' && key !== 'radius') {
      throw new Error(
        "Unexpected attribute '" + key + "'' found in query criteria",
      );
    }
  }

  // Validate the "center" attribute
  if (typeof newQueryCriteria.center !== 'undefined') {
    validateLocation(newQueryCriteria.center);
  }

  // Validate the "radius" attribute
  if (typeof newQueryCriteria.radius !== 'undefined') {
    if (
      typeof newQueryCriteria.radius !== 'number' ||
      isNaN(newQueryCriteria.radius)
    ) {
      throw new Error('radius must be a number');
    } else if (newQueryCriteria.radius < 0) {
      throw new Error('radius must be greater than or equal to 0');
    }
  }
};

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees The number of degrees to be converted to radians.
 * @return {number} The number of radians equal to the inputted number of degrees.
 */
const degreesToRadians = function(degrees) {
  if (typeof degrees !== 'number' || isNaN(degrees)) {
    throw new Error('Error: degrees must be a number');
  }

  return (degrees * Math.PI) / 180;
};

/**
 * Generates a geohash of the specified precision/string length from the  [latitude, longitude]
 * pair, specified as an array.
 *
 * @param {Array.<number>} location The [latitude, longitude] pair to encode into a geohash.
 * @param {number=} precision The length of the geohash to create. If no precision is
 * specified, the global default is used.
 * @return {string} The geohash of the inputted location.
 */
const encodeGeohash = function(location, precision) {
  validateLocation(location);
  if (typeof precision !== 'undefined') {
    if (typeof precision !== 'number' || isNaN(precision)) {
      throw new Error('precision must be a number');
    } else if (precision <= 0) {
      throw new Error('precision must be greater than 0');
    } else if (precision > 22) {
      throw new Error('precision cannot be greater than 22');
    } else if (Math.round(precision) !== precision) {
      throw new Error('precision must be an integer');
    }
  }

  // Use the global precision default if no precision is specified
  precision = precision || g_GEOHASH_PRECISION;

  const latitudeRange = {
    min: -90,
    max: 90,
  };
  const longitudeRange = {
    min: -180,
    max: 180,
  };
  let hash = '';
  let hashVal = 0;
  let bits = 0;
  let even = 1;

  while (hash.length < precision) {
    const val = even ? location[1] : location[0];
    const range = even ? longitudeRange : latitudeRange;
    const mid = (range.min + range.max) / 2;

    /* jshint -W016 */
    if (val > mid) {
      hashVal = (hashVal << 1) + 1;
      range.min = mid;
    } else {
      hashVal = (hashVal << 1) + 0;
      range.max = mid;
    }
    /* jshint +W016 */

    even = !even;
    if (bits < 4) {
      bits++;
    } else {
      bits = 0;
      hash += g_BASE32[hashVal];
      hashVal = 0;
    }
  }

  return hash;
};

/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param {number} distance The distance to convert.
 * @param {number} latitude The latitude at which to calculate.
 * @return {number} The number of degrees the distance corresponds to.
 */
const metersToLongitudeDegrees = function(distance, latitude) {
  const radians = degreesToRadians(latitude);
  const num = (Math.cos(radians) * g_EARTH_EQ_RADIUS * Math.PI) / 180;
  const denom = 1 / Math.sqrt(1 - g_E2 * Math.sin(radians) * Math.sin(radians));
  const deltaDeg = num * denom;
  if (deltaDeg < g_EPSILON) {
    return distance > 0 ? 360 : 0;
  } else {
    return Math.min(360, distance / deltaDeg);
  }
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param {number} resolution The desired resolution.
 * @param {number} latitude The latitude used in the conversion.
 * @return {number} The bits necessary to reach a given resolution, in meters.
 */
const longitudeBitsForResolution = function(resolution, latitude) {
  const degs = metersToLongitudeDegrees(resolution, latitude);
  return Math.abs(degs) > 0.000001 ? Math.max(1, Math.log2(360 / degs)) : 1;
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param {number} resolution The bits necessary to reach a given resolution, in meters.
 */
const latitudeBitsForResolution = function(resolution) {
  return Math.min(
    Math.log2(g_EARTH_MERI_CIRCUMFERENCE / 2 / resolution),
    g_MAXIMUM_BITS_PRECISION,
  );
};

/**
 * Wraps the longitude to [-180,180].
 *
 * @param {number} longitude The longitude to wrap.
 * @return {number} longitude The resulting longitude.
 */
const wrapLongitude = function(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  let adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  } else {
    return 180 - (-adjusted % 360);
  }
};

/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param {Array.<number>} coordinate The coordinate as a [latitude, longitude] pair.
 * @param {number} size The size of the bounding box.
 * @return {number} The number of bits necessary for the geohash.
 */
const boundingBoxBits = function(coordinate, size) {
  const latDeltaDegrees = size / g_METERS_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, coordinate[0] + latDeltaDegrees);
  const latitudeSouth = Math.max(-90, coordinate[0] - latDeltaDegrees);
  const bitsLat = Math.floor(latitudeBitsForResolution(size)) * 2;
  const bitsLongNorth =
    Math.floor(longitudeBitsForResolution(size, latitudeNorth)) * 2 - 1;
  const bitsLongSouth =
    Math.floor(longitudeBitsForResolution(size, latitudeSouth)) * 2 - 1;
  return Math.min(
    bitsLat,
    bitsLongNorth,
    bitsLongSouth,
    g_MAXIMUM_BITS_PRECISION,
  );
};

/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude].
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<number>>} The eight bounding box points.
 */
const boundingBoxCoordinates = function(center, radius) {
  const latDegrees = radius / g_METERS_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, center[0] + latDegrees);
  const latitudeSouth = Math.max(-90, center[0] - latDegrees);
  const longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
  const longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
  const longDegs = Math.max(longDegsNorth, longDegsSouth);
  return [
    [center[0], center[1]],
    [center[0], wrapLongitude(center[1] - longDegs)],
    [center[0], wrapLongitude(center[1] + longDegs)],
    [latitudeNorth, center[1]],
    [latitudeNorth, wrapLongitude(center[1] - longDegs)],
    [latitudeNorth, wrapLongitude(center[1] + longDegs)],
    [latitudeSouth, center[1]],
    [latitudeSouth, wrapLongitude(center[1] - longDegs)],
    [latitudeSouth, wrapLongitude(center[1] + longDegs)],
  ];
};

/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param {string} geohash The geohash whose bounding box query to generate.
 * @param {number} bits The number of bits of precision.
 * @return {Array.<string>} A [start, end] pair of geohashes.
 */
const geohashQuery = function(geohash, bits) {
  validateGeohash(geohash);
  const precision = Math.ceil(bits / g_BITS_PER_CHAR);
  if (geohash.length < precision) {
    return [geohash, geohash + '~'];
  }
  geohash = geohash.substring(0, precision);
  const base = geohash.substring(0, geohash.length - 1);
  const lastValue = g_BASE32.indexOf(geohash.charAt(geohash.length - 1));
  const significantBits = bits - base.length * g_BITS_PER_CHAR;
  const unusedBits = g_BITS_PER_CHAR - significantBits;
  /*jshint bitwise: false*/
  // delete unused bits
  const startValue = (lastValue >> unusedBits) << unusedBits;
  const endValue = startValue + (1 << unusedBits);
  /*jshint bitwise: true*/
  if (endValue > 31) {
    return [base + g_BASE32[startValue], base + '~'];
  } else {
    return [base + g_BASE32[startValue], base + g_BASE32[endValue]];
  }
};

/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude] pair.
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<string>>} An array of geohashes containing a [start, end] pair.
 */
export var geohashQueries = function(center, radius) {
  validateLocation(center);
  const queryBits = Math.max(1, boundingBoxBits(center, radius));
  const geohashPrecision = Math.ceil(queryBits / g_BITS_PER_CHAR);
  const coordinates = boundingBoxCoordinates(center, radius);
  let queries = coordinates.map(function(coordinate) {
    return geohashQuery(encodeGeohash(coordinate, geohashPrecision), queryBits);
  });
  // remove duplicates
  queries = queries.filter(function(query, index) {
    return !queries.some(function(other, otherIndex) {
      return (
        index > otherIndex && query[0] === other[0] && query[1] === other[1]
      );
    });
  });
  return queries;
};

/**
 * Encodes a location and geohash as a GeoFire object.
 *
 * @param {Array.<number>} location The location as [latitude, longitude] pair.
 * @param {string} geohash The geohash of the location.
 * @return {Object} The location encoded as GeoFire object.
 */
function encodeGeoFireObject(location, geohash) {
  validateLocation(location);
  validateGeohash(geohash);
  return {
    '.priority': geohash,
    g: geohash,
    l: location,
  };
}

/**
 * Decodes the location given as GeoFire object. Returns null if decoding fails.
 *
 * @param {Object} geoFireObj The location encoded as GeoFire object.
 * @return {?Array.<number>} location The location as [latitude, longitude] pair or null if
 * decoding fails.
 */
function decodeGeoFireObject(geoFireObj) {
  if (
    geoFireObj !== null &&
    geoFireObj.hasOwnProperty('l') &&
    Array.isArray(geoFireObj.l) &&
    geoFireObj.l.length === 2
  ) {
    return geoFireObj.l;
  } else {
    throw new Error(
      'Unexpected GeoFire location object encountered: ' +
        JSON.stringify(geoFireObj),
    );
  }
}

/**
 * Returns the key of a Firebase snapshot across SDK versions.
 *
 * @param {DataSnapshot} snapshot A Firebase snapshot.
 * @return {string|null} key The Firebase snapshot's key.
 */
function getKey(snapshot) {
  let key;
  if (typeof snapshot.key === 'function') {
    key = snapshot.key();
  } else if (typeof snapshot.key === 'string' || snapshot.key === null) {
    key = snapshot.key;
  } else {
    key = snapshot.name();
  }
  return key;
}

/**
 * calculates the distance, in kilometers, between two locations,
 * via the Haversine formula. Note that this is approximate due to the fact that the
 * Earth's radius varies between 6356.752 km and 6378.137 km.
 *
 * @param {Array.<number>} location1 The [latitude, longitude] pair of the first location.
 * @param {Array.<number>} location2 The [latitude, longitude] pair of the second location.
 * @return {number} The distance, in kilometers, between the inputted locations.
 */
export var calculateDistance = function(location1, location2) {
  try {
    validateLocation(location1);
    validateLocation(location2);
  } catch (error) {
    return -1;
  }

  const radius = 6371; // Earth's radius in kilometers
  const latDelta = degreesToRadians(location2[0] - location1[0]);
  const lonDelta = degreesToRadians(location2[1] - location1[1]);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(degreesToRadians(location1[0])) *
      Math.cos(degreesToRadians(location2[0])) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
};
