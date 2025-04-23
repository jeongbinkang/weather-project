"use strict";
const API_KEY = "8c5eb0efc1c00bc073a10d110db03cda";
let city = "Gwangju";
// 검색 버튼 클릭 이벤트
document.getElementById("search-btn")?.addEventListener("click", () => {
    const inputCity = document.getElementById("city-input").value;
    if (inputCity) {
        city = inputCity;
        getWeather(city);
        getForecast(city);
        getHourlyForecast(city);
    }
});
// 현재 날씨 정보 가져오기
function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
        const iconCode = data.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const cityName = data.name;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const weatherTime = new Date(data.dt * 1000);
        const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(weatherTime);
        const hour = weatherTime.getHours();
        const minute = `${weatherTime.getMinutes()}`.padStart(2, "0");
        const isPM = hour >= 12;
        const displayHour = hour % 12 || 12;
        const ampm = isPM ? "PM" : "AM";
        const time = `${displayHour.toString().padStart(2, "0")}:${minute} ${ampm}`;
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");
        const rain = data.rain ? data.rain["1h"] : 0;
        if (dateElement && timeElement) {
            dateElement.innerText = weekday;
            timeElement.innerText = time;
        }
        document.getElementById("weather-icon").src = iconUrl;
        document.getElementById("temp").innerText = `${temp}°C`;
        document.getElementById("city").innerText = cityName;
        document.getElementById("humidity").innerText = `습도  ${humidity}%`;
        document.getElementById("wind").innerText = `풍속  ${windSpeed} m/s`;
        document.getElementById("rain").innerText = `강수  ${rain}%`;
    })
        .catch(err => console.error("날씨 정보를 불러오는 중 오류 발생:", err));
}
// 5일 예보
function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = '';
        const dailyMap = new Map();
        for (const item of data.list) {
            const date = new Date(item.dt * 1000);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            if (!dailyMap.has(key))
                dailyMap.set(key, []);
            dailyMap.get(key)?.push(item);
        }
        let count = 0;
        for (const [key, items] of dailyMap.entries()) {
            if (count >= 5)
                break;
            const temps = items.map(i => i.main.temp);
            const tempMin = Math.min(...temps);
            const tempMax = Math.max(...temps);
            const iconCode = items[0].weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
            const date = new Date(items[0].dt * 1000);
            const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const pop = items[0].pop !== undefined ? items[0].pop * 100 : 0;
            const forecastWrapper = document.createElement("div");
            forecastWrapper.classList.add("forecast-item-wrapper");
            forecastWrapper.innerHTML = `
          <div class="forecast-date">${weekday}</div>
          <div class="month-day">${month}.${day}</div>
          <img src="${iconUrl}" alt="weather icon" class="forecast-icon"/>
          <div class="forecast-temp">
            <span class="temp-min">${Math.round(tempMin)}°</span> /
            <span class="temp-max">${Math.round(tempMax)}°</span>
          </div>
          <div class="forecast-pop"><img src="/src/assets/rain-icon.png">${pop}%</div>
        `;
            forecastContainer.appendChild(forecastWrapper);
            count++;
        }
    })
        .catch(err => console.error("날씨 예보를 불러오는 중 오류 발생:", err));
}
// 시간대별 날씨 출력 (오늘 기준)
function getHourlyForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
        const hourlyContainer = document.getElementById("hourly");
        hourlyContainer.innerHTML = "";
        // 3시간 간격 예보 중 앞에서부터 8개만 출력
        const forecastList = data.list.slice(0, 8);
        for (const item of forecastList) {
            const time = new Date(item.dt * 1000);
            const hour = time.getHours().toString().padStart(2, "0");
            const icon = item.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
            const temp = Math.round(item.main.temp);
            const hourlyEl = document.createElement("div");
            hourlyEl.classList.add("hour-item-wrapper");
            hourlyEl.innerHTML = `
          <div class="hourly-item">
            <div class="hour">${hour}:00</div>
            <img src="${iconUrl}" alt="icon" class="hour-icon"/>
            <div class="hour-temp">${temp}°C</div>
          </div>
        `;
            hourlyContainer.appendChild(hourlyEl);
        }
    })
        .catch(err => {
        console.error("시간대별 날씨 정보를 불러오는 중 오류 발생:", err);
    });
}
// 페이지 로드 시 초기 호출
getWeather(city);
getForecast(city);
getHourlyForecast(city);
