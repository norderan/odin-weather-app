import "./styles.css";
import { fetchWeatherData } from "./weatherService";



fetchWeatherData("New York").then(data => {
    console.log("Weather Data:", data);
});