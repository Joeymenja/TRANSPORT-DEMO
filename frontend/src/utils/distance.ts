/**
 * Calculates the Haversine distance between two points on Earth.
 * Adds a configurable 'road factor' to account for real-world driving.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number, roadFactor: number = 1.25): number => {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
    
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    
    return parseFloat((dist * roadFactor).toFixed(1));
};

/**
 * Calculates the total distance for a trip given its stops.
 */
export const calculateTripDistance = (stops: any[]): number => {
    if (!stops || stops.length < 2) return 0;
    
    // Sort by stopOrder if available
    const sortedStops = [...stops].sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0));
    
    let totalDist = 0;
    for (let i = 0; i < sortedStops.length - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i+1];
        if (s1.latitude && s1.longitude && s2.latitude && s2.longitude) {
            totalDist += calculateDistance(s1.latitude, s1.longitude, s2.latitude, s2.longitude);
        }
    }
    return parseFloat(totalDist.toFixed(1));
};
