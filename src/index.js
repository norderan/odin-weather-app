import "./styles.css";
import { fetchWeatherData } from "./weatherService";


async function displayWeather(city, unit) {
    try {
        const weatherData = await fetchWeatherData(city, unit);

        // Remove previous weather info if exists
        const oldSidebar = document.getElementById("weather-info-sidebar");
        if (oldSidebar) oldSidebar.remove();

        // Helper to get weather icon URL
        function getIconUrl(icon) {
            const iconMap = {
                "partly-cloudy-day": "https://ssl.gstatic.com/onebox/weather/64/partly_cloudy.png",
                "cloudy": "https://ssl.gstatic.com/onebox/weather/64/cloudy.png",
                "rain": "https://ssl.gstatic.com/onebox/weather/64/rain.png",
                "sunny": "https://ssl.gstatic.com/onebox/weather/64/sunny.png",
                // Add more mappings as needed
            };
            return iconMap[icon] || iconMap["sunny"];
        }

        // Format date and time
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
        }

        // Format time (HH:MM)
        function formatTime(timeStr) {
            return timeStr ? timeStr.slice(0, 5) : "";
        }

        // Get weekday from date
        function getWeekday(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { weekday: "short" });
        }

        // Main sidebar
        const sidebar = document.createElement("div");
        sidebar.id = "weather-info-sidebar";

        // Current day (day0)
        const day0 = weatherData.day0;
        const now = new Date();
        const dateTime = `${formatDate(day0.date)} | ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        sidebar.innerHTML = `
            <h3>${dateTime}</h3>
            <h1>${weatherData.cityName || city}</h1>
            <h1 id="temp">${Math.round(day0.temp)}°${unit}</h1>
            <p>${day0.description || ""}</p>
            <p><span class="material-icons" style="vertical-align:middle;">water_drop</span> <strong>Humidity:</strong> ${Math.round(day0.humidity)}%</p>
            <p><span class="material-icons" style="vertical-align:middle;">air</span> <strong>Wind:</strong> ${Math.round(day0.windSpeed)} km/h</p>
            <p><span class="material-icons" style="vertical-align:middle;">wb_sunny</span> <strong>UV Index:</strong> ${day0.uviindex ?? "-"}</p>
            <p><span class="material-icons" style="vertical-align:middle;">wb_twilight</span> <strong>Sunrise:</strong> ${formatTime(day0.sunrise)}</p>
            <p><span class="material-icons" style="vertical-align:middle;">nights_stay</span> <strong>Sunset:</strong> ${formatTime(day0.sunset)}</p>
            <img src="${getIconUrl(day0.icon)}" alt="Weather icon" width="60" />
        `;

        // Forecast container
        const forecastContainer = document.createElement("div");
        forecastContainer.id = "forecast-container";

        // Days 1-4
        for (let i = 1; i <= 4; i++) {
            const day = weatherData[`day${i}`];
            if (!day) continue;
            const forecastDay = document.createElement("div");
            forecastDay.className = "forecast-day";
            forecastDay.innerHTML = `
                <p>${getWeekday(day.date)}</p>
                <img src="${getIconUrl(day.icon)}" alt="${day.icon}">
                <span>${Math.round(day.temp)}°</span>
            `;
            forecastContainer.appendChild(forecastDay);
        }

        sidebar.appendChild(forecastContainer);
        document.body.appendChild(sidebar);

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
    }
}

displayWeather("beersheva", "c"); // Replace with any city you want to test
let unit = "c";

const unitToggleButton = document.getElementById("unit-toggle-button");
unitToggleButton.addEventListener("click", () => {
    unit = unit === "c" ? "f" : "c";
    const city = searchInput.value.trim() || "beersheva";
    displayWeather(city, unit);
});
const searchInput = document.getElementById("search-city-input");
const searchButton = document.getElementById("search-city-button");

searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        displayWeather(city, unit);
    }
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            displayWeather(city, unit);
        }
    }
});


