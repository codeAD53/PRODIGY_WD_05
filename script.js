const apiKey = 'f300d2849e2e3ad2e3be42ccd9e5bfd6';
const forecastData = document.getElementById('forecastData');
const weatherData = document.getElementById('weatherData');
const timestamp = document.getElementById('timestamp');

let isFahrenheit = false;

document.getElementById('unitToggle').addEventListener('change', function () {
    isFahrenheit = this.checked;
    const city = document.getElementById('cityInput').value;
    if (city) {
        getWeatherByCity(city);
        getForecastByCity(city);
    } else {
        getLocationWeather();
    }
});
document.getElementById('cityInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getWeatherByCity(e.target.value);
        getForecastByCity(e.target.value);
    }
});

function getWeatherByCity(city) {
    const unit = isFahrenheit ? 'imperial' : 'metric';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`)
        .then(res => res.json())
        .then(data => displayWeather(data))
        .catch(() => {
            weatherData.innerHTML = `<p>❌ City not Found</p>`;
            forecastData.innerHTML = '';
            timestamp.textContent = '';
            forecastData.style.display = 'none';
            timestamp.style.display = 'none';
        });
}

function displayWeather(data) {
    if (data.cod !== 200) return;

    const { name, main, weather, wind } = data;
    const temperature = main.temp;
    const unit = isFahrenheit ? '°F' : '°C';
    weatherData.innerHTML = `
        <h2>${name}</h2>
        <img class="icon" src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" />
        <p>${weather[0].main} - ${weather[0].description}</p>
        <p>🌡️ Temp: ${temperature.toFixed(1)}${unit}</p>
        <p>💧 Humidity: ${main.humidity}%</p>
        <p>🌬️ Wind: ${wind.speed} m/s</p>
    `;

    const time = new Date();
    timestamp.textContent = `Last updated: ${time.toLocaleTimeString()}`;

    weatherData.style.display = 'block';
    timestamp.style.display = 'block';

}

function getLocationWeather() {
    const unit = isFahrenheit ? 'imperial' : 'metric';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`)
                .then(res => res.json())
                .then(data => displayWeather(data));

            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`)
                .then(res => res.json())
                .then(data => displayForecast(data));
        },
            (error) => {
                let message = "Unable to access your location.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Location permission denied. Please search for a city.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    message = "Location request timed out.";
                }
                weatherData.innerHTML = `<p>❌ ${message}</p>`;
                forecastData.innerHTML = '';
                timestamp.textContent = '';
            }
        );
    } else {
        weatherData.innerHTML = '<p>❌ Geolocation is not supported by browser.</p>';
        forecastData.innerHTML = '';
        timestamp.textContent = '';
    }
}

function getForecastByCity(city) {
    const unit = isFahrenheit ? 'imperial' : 'metric';
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`)
        .then(res => res.json())
        .then(data => displayForecast(data));
}

function displayForecast(data) {
    if (!data || !data.list) return;

    const forecastByDay = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecastByDay[date]) {
            forecastByDay[date] = [];
        }
        forecastByDay[date].push(item);
    });

    const dates = Object.keys(forecastByDay).slice(0, 3);
    let html = `<h3>3-Day Forecast</h3>`;

    dates.forEach(date => {
        const dayItems = forecastByDay[date];
        const readableDate = new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        html += `<h4>${readableDate}</h4><div class="forecast-cards">`;

        const timeSlots = ['09:00:00', '15:00:00', "21:00:00"];
        timeSlots.forEach(time => {
            const slotItem = dayItems.find(item => item.dt_txt.includes(time));
            if (slotItem) {
                const iconUrl = `http://openweathermap.org/img/wn/${slotItem.weather[0].icon}@2x.png`
                const description = slotItem.weather[0].main;
                const temp = slotItem.main.temp;
                const unitSymbol = isFahrenheit ? '°F' : '°C';

                html += `
        <div class="forecast-card">
        <p><strong>${time.split(':')[0]}:00</strong></p>
        <img src = "${iconUrl}" alt="${description}" width="50" />
        <p>${description}</p>
        <p>${temp.toFixed(1)}${unitSymbol}</p>
        </div>
        `;
            }
        });

        html += `</div>`;
    });

    forecastData.innerHTML = html;

    forecastData.style.display = 'block';


}
function toggleMode() {
    document.body.classList.toggle('light-mode');
}

function toggleForecastView() {
    document.querySelectorAll('.forecast-cards').forEach(el => {
        el.classList.toggle('horizontal');
    });
}

function resetApp(){
    document.getElementById('cityInput').value = '';
    weatherData.innerHTML = `<p>🔍Search or allow locatiion...</p>`
    forecastData.innerHTML = '';
    timestamp.textContent = '';
    weatherData.style.display = 'none';
    forecastData.style.display = 'none';
    timestamp.style.display = 'none';
}

window.onload = () => {
    weatherData.style.display = 'none';
    forecastData.style.display = 'none';
    timestamp.style.display = 'none';
};

window.onload = getLocationWeather;
