const apiKey = 'fcb0ac96374b374ec677790d8ddafeab'; // Replace with your OpenWeatherMap API key
const geoUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
const oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall?units=metric&';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const loading = document.getElementById('loading');
const searchHistory = []; // Array to store recent searches

searchBtn.addEventListener('click', () => {
  const city = cityInput.value;
  if (city) {
    fetchCoordinates(city);
    addToHistory(city);
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { // Check if the pressed key is "Enter"
    const city = cityInput.value;
    if (city) {
      fetchCoordinates(city);
      addToHistory(city);
    }
  }
});

document.getElementById('search-btn').addEventListener('click', () => {
  const cityInput = document.getElementById('city-input');
  const errorMessage = document.getElementById('error-message');

  if (cityInput.value.trim() === '') {
    errorMessage.textContent = 'Please enter a city name.'; // Custom error message
    errorMessage.style.display = 'block'; // Show error message
    
    // Add shake animation to the search bar
    cityInput.classList.add('shake');

    // Remove the shake class after the animation ends
    cityInput.addEventListener('animationend', () => {
      cityInput.classList.remove('shake');
      }, { once: true }); // Ensure the event listener is removed after running once
  } else {
    errorMessage.style.display = 'none'; // Hide error message if input is valid
    fetchWeatherByCity(cityInput.value); // Call your weather fetching function
  }
});

document.getElementById('city-input').addEventListener('input', () => {
  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'none'; // Hide error message as the user types
});


document.getElementById('history-list').addEventListener('click', (event) => {
  if (event.target.classList.contains('history-item')) {
    const city = event.target.textContent;
    fetchCoordinates(city);
  }
});

document.getElementById('search-icon').addEventListener('click', () => {
  document.getElementById('search-btn').click(); // Trigger the search button click
});


async function fetchCoordinates(city) {
  try {
    loading.style.display = 'block'; // Show loading section
    const geoResponse = await fetch(geoUrl + city + `&limit=1&appid=${apiKey}`);
    const geoData = await geoResponse.json();
    console.log('Geocoding API Response:', geoData); // Log the Geocoding API response

    if (geoData.length > 0) {
      const { lat, lon, name } = geoData[0];
      fetchWeather(lat, lon, name);
    } else {
      weatherInfo.innerHTML = `<p>City not found. Please try again.</p>`;
      loading.style.display = 'none'; // Hide loading section
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    weatherInfo.innerHTML = `<p>An error occurred. Please try again later.</p>`;
    loading.style.display = 'none'; // Hide loading section
  } finally {
    cityInput.value = ''; // Clear the input field after search
  }
}

// Helper function to get local time from timestamp and timezone offset
function getLocalTime(timestamp, timezoneOffset) {
  console.log('Timestamp:', timestamp); // Log the timestamp
  console.log('Timezone Offset:', timezoneOffset); // Log the timezone offset

  const utcTime = timestamp * 1000; // Convert timestamp to milliseconds
  const localTime = new Date(utcTime + timezoneOffset * 1000 ); // Apply timezone offset
  console.log('Local Time:', localTime); // Log the calculated local time

  return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchWeather(lat, lon, cityName) {
  try {
    loading.style.display = 'block'; // Show loading section
    const oneCallResponse = await fetch(oneCallUrl + `lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const oneCallData = await oneCallResponse.json();
    console.log('API Response:', oneCallData); // Log the API response for debugging

    if (oneCallData.current) {
      const { temp, humidity, dt } = oneCallData.current;
      const { description, icon } = oneCallData.current.weather[0];
      const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

      // Calculate local time using the timezone offset
      const localTime = getLocalTime(dt, oneCallData.timezone_offset);

      // Add a 1-second delay before displaying the result and hiding the loading section
      setTimeout(() => {
        weatherInfo.innerHTML = `
          <h2>${cityName}</h2>
          <img src="${iconUrl}" alt="${description}">
          <p>Temperature: ${temp.toFixed(2)}&deg;C</p>
          <p>Humidity: ${humidity}%</p>
          <p>Weather: ${description}</p>
          <p>Local Time: ${localTime}</p> <!-- Display local time -->
        `;
        loading.style.display = 'none'; // Hide loading section after displaying the result
      }, 1000); // 1-second delay
    } else {
      // If no data is found, hide the loading section immediately
      weatherInfo.innerHTML = `<p>Weather data not found. Please try again.</p>`;
      loading.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    weatherInfo.innerHTML = `<p>An error occurred. Please try again later.</p>`;
    loading.style.display = 'none'; // Hide loading section in case of error
  }
}



searchBtn.addEventListener('click', () => {
  const city = cityInput.value;
  if (city) {
    fetchCoordinates(city);
    addToHistory(city);
  }
});

function addToHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    if (searchHistory.length > 5) {
      searchHistory.shift(); // Keep only the last 5 searches
    }
    updateHistory();
  }
}

function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = searchHistory.map(city => `<li class="history-item">${city}</li>`) // Add class="history-item"
    .join('');
}
