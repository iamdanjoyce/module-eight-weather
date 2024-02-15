function initializePage() {
    const cityElement = document.getElementById("enter-city");
    const searchButton = document.getElementById("search-button");
    const clearHistoryButton = document.getElementById("clear-history");
    const cityNameElement = document.getElementById("city-name");
    const currentPicElement = document.getElementById("current-pic");
    const currentTempElement = document.getElementById("temperature");
    const currentHumidityElement = document.getElementById("humidity");
    const currentWindElement = document.getElementById("wind-speed");
    const currentUVElement = document.getElementById("UV-index");
    const historyElement = document.getElementById("history");
    const fiveDayElement = document.getElementById("fiveday-header");
    const todayWeatherElement = document.getElementById("today-weather");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

    const apiKey = "2e49799c515e96f0aedb728c3c4b59cc";

    function getWeather(cityName) {
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            todayWeatherElement.classList.remove("d-none");

            const currentDate = new Date(response.dt * 1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            cityNameElement.innerHTML = `${response.name} (${day}/${month}/${year})`;
            let weatherIcon = response.weather[0].icon;
            currentPicElement.setAttribute("src", `https://openweathermap.org/img/wn/${weatherIcon}.png`);
            currentPicElement.setAttribute("alt", response.weather[0].description);
            currentTempElement.innerHTML = `Temperature: ${response.main.temp} &#176C`;
            currentHumidityElement.innerHTML = `Humidity: ${response.main.humidity}%`;
            currentWindElement.innerHTML = `Wind Speed: ${response.wind.speed} m/s`;

            let latitude = response.coord.lat;
            let longitude = response.coord.lon;
            let uvQueryURL = `https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}`; 
             $.ajax({
                url: uvQueryURL,
                method: "GET"
            }).then(function (response) {
                let uvIndex = document.createElement("span");
                if (response[0].value < 4) {
                    uvIndex.setAttribute("class", "badge badge-success");
                } else if (response[0].value < 8) {
                    uvIndex.setAttribute("class", "badge badge-warning");
                } else {
                    uvIndex.setAttribute("class", "badge badge-danger");
                }
                uvIndex.innerHTML = response[0].value;
                currentUVElement.innerHTML = "UV Index: ";
                currentUVElement.append(uvIndex);
            });

            let cityID = response.id;
            let forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${apiKey}&units=metric`;
            $.ajax({
                url: forecastQueryURL,
                method: "GET"
            }).then(function (response) {
                fiveDayElement.classList.remove("d-none");
                const forecastElements = document.querySelectorAll(".forecast");
                for (let i = 0; i < forecastElements.length; i++) {
                    forecastElements[i].innerHTML = "";
                    const forecastIndex = i * 8 + 4;
                    const forecastDate = new Date(response.list[forecastIndex].dt * 1000);
                    const day = forecastDate.getDate();
                    const month = forecastDate.getMonth() + 1;
                    const forecastDateElement = document.createElement("p");
                    forecastDateElement.setAttribute("class", "mt-3 mb-0 forecast-date");
                    forecastDateElement.innerHTML = `${day}/${month}`;
                    forecastElements[i].append(forecastDateElement);

                    const forecastWeatherElement = document.createElement("img");
                    forecastWeatherElement.setAttribute("src", `https://openweathermap.org/img/wn/${response.list[forecastIndex].weather[0].icon}.png`);
                    forecastWeatherElement.setAttribute("alt", response.list[forecastIndex].weather[0].description);
                    forecastElements[i].append(forecastWeatherElement);
                    const forecastTempElement = document.createElement("p");
                    forecastTempElement.innerHTML = `Temp: ${response.list[forecastIndex].main.temp} &#176C`;
                    forecastElements[i].append(forecastTempElement);
                    const forecastHumidityElement = document.createElement("p");
                    forecastHumidityElement.innerHTML = `Humidity: ${response.list[forecastIndex].main.humidity}%`;
                    forecastElements[i].append(forecastHumidityElement);
                }
            })
        });
    }

    searchButton.addEventListener("click", function () {
        const searchTerm = cityElement.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    clearHistoryButton.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })

    function renderSearchHistory() {
        historyElement.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", function () {
                getWeather(historyItem.value);
            })
            historyElement.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}

initializePage();
