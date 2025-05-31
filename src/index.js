import "./styles.css";
import { fetchWeatherData } from "./weatherService";
import { setMapCoordinates , map , switchTileLayer} from "./mapService";
async function displayWeather(city, unit) {
    try {
        console.log("Fetching weather data for:", city, "with unit:", unit);
        showLoading();
        const weatherData = await fetchWeatherData(city, unit);
        removeLoader();

        if (weatherData instanceof Error) {
            showSearchError(city); 
            return;
        }
        if (typeof city !== 'object') { 
            setMapCoordinatesWithIgnore(weatherData.coordinates);
        }
        

        
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
            <h1 id="dispalyName">${weatherData.displayName}</h1>
            <div id="temp-and-icon"> 
                <h1 id="temp">${Math.round(day0.temp)}°${unit}</h1>
                <img src="${getIconUrl(day0.icon)}" alt="Weather icon" width="60" />
            </div>
            <p>${day0.description}</p>
            <p><span class="material-icons" style="vertical-align:middle;">water_drop</span> <strong>Humidity:</strong> ${Math.round(day0.humidity)}%</p>
            <p><span class="material-icons" style="vertical-align:middle;">air</span> <strong>Wind:</strong> ${Math.round(day0.windSpeed)} km/h</p>
            <p><span class="material-icons" style="vertical-align:middle;">wb_sunny</span> <strong>UV Index:</strong> ${day0.uviindex ?? "-"}</p>
            <p><span class="material-icons" style="vertical-align:middle;">wb_twilight</span> <strong>Sunrise:</strong> ${formatTime(day0.sunrise)}</p>
            <p><span class="material-icons" style="vertical-align:middle;">nights_stay</span> <strong>Sunset:</strong> ${formatTime(day0.sunset)}</p>
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
        console.error("[-] Failed to fetch weather data:", error);
    }
}

displayWeather("London", "c"); // Replace with any city you want to test

let unit = "c";

// Toggle unit between Celsius and Fahrenheit
const unitToggleButton = document.getElementById("unit-toggle-button");
unitToggleButton.addEventListener("click", () => {
    unit = unit === "c" ? "f" : "c";
    const center = map.getCenter();
        const city = {
        lat: center.lat.toFixed(4),
        lon: center.lng.toFixed(4)
    };
    displayWeather(city, unit);
});

// Search functionality
const searchInput = document.getElementById("search-city-input");
const searchButton = document.getElementById("search-city-button");

function showLoading() {
    let loaderContainer = document.getElementById("loader-container");
    if (!loaderContainer) {
        loaderContainer = document.createElement("div");
        loaderContainer.id = "loader-container";
        document.body.appendChild(loaderContainer);
    }
    // Remove any existing loader inside the container
    loaderContainer.innerHTML = "";
    const loader = document.createElement("div");
    loader.className = "loader";
    loaderContainer.appendChild(loader);
}

function removeLoader() {
    const loaderContainer = document.getElementById("loader-container");
    if (loaderContainer) loaderContainer.remove();
}


// Ensure #city-not-found is hidden by default
const errorElemInit = document.getElementById("city-not-found");
if (errorElemInit) {
    errorElemInit.style.display = "none";
    errorElemInit.textContent = "";
}

function showSearchError(city) {
    const errorElem = document.getElementById("city-not-found");
    if (!errorElem) return;
    errorElem.style.display = "block";
    errorElem.textContent = `"${city}" was not found.`;
    setTimeout(() => {
        errorElem.style.display = "none";
        errorElem.textContent = "";
    }, 2000);
}
searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        displayWeather(city, unit);
        searchInput.value = ""; // Clear search after
    }
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            displayWeather(city, unit);
            searchInput.value = ""; // Clear search after
        }
    }
});


// map service:

let ignoreNextMove = false;

function setMapCoordinatesWithIgnore(coords) {
    ignoreNextMove = true;
    setMapCoordinates(coords);
}

let lastCenter = map.getCenter();

map.on('moveend', () => {
    const center = map.getCenter();
    const distance = Math.sqrt(
        Math.pow(center.lat - lastCenter.lat, 2) +
        Math.pow(center.lng - lastCenter.lng, 2)
    );
    // Only trigger if moved more than ~0.01 degrees (~1km, adjust as needed)
    if (ignoreNextMove) {
        ignoreNextMove = false;
        lastCenter = center;
        return;
    }
    if (distance < 0.1) return;
    lastCenter = center;
    console.log('[+] Map moved:', center.lat, center.lng);
    const city = {
        lat: center.lat.toFixed(4),
        lon: center.lng.toFixed(4)
    };
    displayWeather(city, unit);
});


// Dark Mode Toggle

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark-mode");
}

const darkModeToggle = document.getElementById("toggle");
darkModeToggle.addEventListener("change", () => {
    toggleDarkMode();
    switchTileLayer();
});


function applySystemThemePreference() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
        document.documentElement.classList.add("dark-mode");
        document.getElementById("toggle").checked = true;
            switchTileLayer();

    } else {
        document.documentElement.classList.remove("dark-mode");
        document.getElementById("toggle").checked = false;
    }
}

// Listen for changes in system theme preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemThemePreference);

// Apply on load
applySystemThemePreference();   