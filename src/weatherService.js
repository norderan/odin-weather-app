async function fetchWeatherData(city, unit = 'c') {
    try {
        const unitGroup = unit === 'c' ? 'metric' : 'us';
        let url;
        if (typeof city === 'object' && city.lat && city.lon) {
            url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city.lat},${city.lon}?unitGroup=${unitGroup}&include=days%2Calerts%2Ccurrent&key=WTV5DCP8S6Y65YD7XGFAZ9MAX&contentType=json`;
        } else {
            url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=${unitGroup}&include=days%2Calerts%2Ccurrent&key=WTV5DCP8S6Y65YD7XGFAZ9MAX&contentType=json`;
        }
        const response = await fetch(url);
        const weatherData = await response.json();

        const displayNameResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${weatherData.latitude}&lon=${weatherData.longitude}&format=json`)
        const displayNameData = await displayNameResponse.json();
        const displayName = displayNameData.address?.city || displayNameData.address?.town || displayNameData.address?.village || displayNameData.address?.state || displayNameData.address?.country || "Unknown Location";
        console.log("[+] New location:", displayName);
        return {
            displayName: displayName,
            coordinates: {
            lat: weatherData.latitude,
            lon: weatherData.longitude
            },
            day0: {
            date: weatherData.days[0].datetime,
            temp: weatherData.days[0].temp,
            humidity: weatherData.days[0].humidity,
            windSpeed: weatherData.days[0].windspeed,
            uviindex: weatherData.days[0].uvindex,
            sunrise: weatherData.days[0].sunrise,
            sunset: weatherData.days[0].sunset,
            description: weatherData.days[0].description,
            icon: weatherData.days[0].icon
            },
            day1: {
            date: weatherData.days[1].datetime,
            temp: weatherData.days[1].temp,
            sunrise: weatherData.days[1].sunrise,
            sunset: weatherData.days[1].sunset,
            icon: weatherData.days[1].icon
            },
            day2: {
            date: weatherData.days[2].datetime,
            temp: weatherData.days[2].temp,
            sunrise: weatherData.days[2].sunrise,
            sunset: weatherData.days[2].sunset,
            icon: weatherData.days[2].icon
            },
            day3: {
            date: weatherData.days[3].datetime,
            temp: weatherData.days[3].temp,
            sunrise: weatherData.days[3].sunrise,
            sunset: weatherData.days[3].sunset,
            icon: weatherData.days[3].icon
            },
            day4: {
            date: weatherData.days[4].datetime,
            temp: weatherData.days[4].temp,
            sunrise: weatherData.days[4].sunrise,
            sunset: weatherData.days[4].sunset,
            icon: weatherData.days[4].icon
            }
        };
    } catch (error) {
        console.error("[-] Error fetching weather data:", error);
        throw error;
    }
}

export { fetchWeatherData };