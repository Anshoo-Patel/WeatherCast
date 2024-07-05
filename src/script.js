const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector("#search-btn");
const locationButton = document.querySelector("#location-btn");
const currentWeather = document.querySelector(".current-weather");
const weatherCards = document.querySelector(".weather-cards");

const API_KEY = "493e0b18d972fe45701303531013fd42"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for current weather card
        return `<div class="details">
                    <h2 class="text-2xl font-bold">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6 class="mt-3 text-xl font-medium">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6 class="mt-3 text-xl font-medium">Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6 class="mt-3 text-xl font-medium">Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon text-center">
                    <img class="max-w-32 -mt-3.5" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6 class="-mt-2 capitalize">${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for five day forecast card
        return `<li class="card py-5 px-4 list-none w-1/3 rounded-md bg-gray-500">
                    <h3 class="font-semibold text-xl">(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img class="max-w-16 mt-1 -mb-2.5 mx-0" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeather.innerHTML = "";
        weatherCards.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeather.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCards.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location

            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Request denied. Please reset location permission to grant access again.");
            } else {
                alert("Request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());