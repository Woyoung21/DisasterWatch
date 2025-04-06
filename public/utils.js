export async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log(
                    `%cCurrent location - latitude: ${location.latitude}, longitude: ${location.longitude}`,
                    "color: green"
                );
                resolve(location);
            },
            (error) => {
                console.error(`%cError getting location: ${error.message}`, "color: red");
                reject(error);
            }
        );
    });
}

export function findNearestCity(latitude, longitude, cityCoordinates) {
    let nearestCity = null;
    let shortestDistance = Infinity;

    // Calculate distance using Haversine formula
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = getDistance(latitude, longitude, coords[0], coords[1]);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestCity = city;
        }
    }

    return nearestCity;
}