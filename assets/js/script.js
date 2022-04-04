
// Declaring gloable variables
var submitBtn = document.getElementById("submitBtn");
var cityName = document.getElementById("searchCitybyName");
var cityDiv = document.getElementById('recentSearch');
var cityErrorEl = document.getElementById('cityHelp');
var currWeatherDiv = document.getElementById("current-weather");
var defaultCity;
var trimmedCityName;
var weatherAPIKey = '&appid=4bb64f9765f05da214fa658d7da7c6c8'
var geoBaseURL = 'https://api.openweathermap.org/geo/1.0/direct?q=';
var forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='

//function to prepare for Geo coding
function callGeoCoding(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.id == 'submitBtn') {
      trimmedCityName = cityName.value.trim();
      cityName.setAttribute ('placeholder',trimmedCityName);
      defaultCity = false;
      console.log("defaultCity :"  + defaultCity);
      cityName.value = '';
    } else if (event.target.id == 'recentSearchedCity') {
      trimmedCityName = event.target.innerText;
      cityName.setAttribute ('placeholder',trimmedCityName)
    }
    //console.log('in geocoding')
    if (trimmedCityName) {
      getLatLon(trimmedCityName);
    }
    
}

//function for retrieving lat/longtitude 
function getLatLon(trimmedCityName) {
    var arrLatLon = [];
    georeqURL = geoBaseURL + trimmedCityName + '&limit=5' +  weatherAPIKey;
    // console.log(georeqURL);

    fetch(georeqURL)
    .then(function (response) {
      if (response.ok) {

        response.json().then(function (data) {
          var index = data.findIndex(e => e.country === 'US');
          if (index !== -1) {
              cityErrorEl.textContent = 'We support only US citites for now!!';
              cityErrorEl.setAttribute ('class','cityValid');
              getWeatherData(data[index].lat,data[index].lon);
              recentSearches(trimmedCityName);
          } else {
            cityErrorEl.textContent = 'Please search US Cities ONLY!!'; 
            cityName.value = '';
            cityErrorEl.setAttribute ('class','cityError');
            return; 
          }
        });
      } else {
        alert('Error: ' + response.statusText);
        return;
      }
    })
    .catch(function (error) {
      alert('Unable to connect to GeoCoding API');
      return;
    });
}

//function to get weather data using Lat and Lon
function getWeatherData(arrLat, arrLon) {

  var exclusion = '&exclude=minutely,hourly';

  forecastReqURL = forecastURL + arrLat + "&lon=" + arrLon + exclusion + weatherAPIKey + '&units=imperial';


  fetch(forecastReqURL)
  .then(function (response) {
    if (response.ok) {

      response.json().then(function (data) {
        // console.log(data);
        buildPage(data);
        return;
      });
    } else {
      alert('Error: ' + response.statusText);
      return;
    }
  })
  .catch(function (error) {
    alert('Unable to connect to weather API');
    return;
  });

}

// Function to convert unix UTC to standard date
function convertUTC2date(unixTimestamp){
    var milliseconds = unixTimestamp * 1000;
    var dateObject = new Date(milliseconds)
    var humanFormat = dateObject.toLocaleString("en-US", {timeZoneName: "short"}) // 12/9/2019, 10:30:15 AM CST
    var convertedDate = humanFormat.slice(0,9);
    if (convertedDate.includes(",")) {
      convertedDate = humanFormat.slice(0,8);
    };
    return convertedDate;
}


//Function to build the page
function buildPage(data){

  //Setting up current weather header data
  currWeatherDiv.innerHTML =''
  var currentHeaderEl = document.createElement("h2");
  currentHeaderEl.setAttribute('class','col-lg-12 row custom-header');

  var currentCityEl=document.createElement('p');
  currentCityEl.textContent = trimmedCityName ;

  var spaceSpan = document.createElement('span');

  spaceSpan.innerHTML = "&nbsp;"

  var currentDateEl = document.createElement('p');
  currentDateEl.textContent = "(" + convertUTC2date(data.current.dt) + ")";

  var currentMoodDiv = document.createElement("div");
  var currentMoodIcon = document.createElement('img');
  const currentIconLink = 'http://openweathermap.org/img/wn/'+ data.current.weather[0].icon + '.png';
  currentMoodIcon.setAttribute ('src', currentIconLink);
  
  currentMoodDiv.appendChild(currentMoodIcon);
  currentHeaderEl.appendChild(currentCityEl);
  currentHeaderEl.appendChild(spaceSpan);
  currentHeaderEl.appendChild(currentDateEl);
  currentHeaderEl.appendChild(currentMoodDiv);
  currWeatherDiv.appendChild(currentHeaderEl);

  //Setting up current weather information 
  var currentTempEl = document.createElement('p');
  currentTempEl.textContent = 'Temp : ' + data.current.temp + "°F";

  var currentWindEl = document.createElement('p');
  currentWindEl.textContent = 'Wind : ' + data.current.wind_speed + "MPH";

  var currentHumidityEl = document.createElement('p');
  currentHumidityEl.textContent = "Humidity : " + data.current.humidity + "%"

  var currentUVIEl = document.createElement('p');
  currentUVIEl.textContent = "UV Index : "
  var uviSpan = document.createElement('span');
  uviSpan.textContent =  data.current.uvi;

  if (data.current.uvi < 4) {
    uviSpan.setAttribute('class','uv-green')
  }
  currentUVIEl.appendChild(uviSpan);

  currWeatherDiv.appendChild(currentTempEl);
  currWeatherDiv.appendChild(currentWindEl);
  currWeatherDiv.appendChild(currentHumidityEl);
  currWeatherDiv.appendChild(currentUVIEl);



  // building forecast section!! 
  var cardTile = document.getElementById('card-tile');
  cardTile.innerHTML = '';

  for (let i=0; i<=4; i++){

    var cardDiv = document.createElement("div"); 
    cardDiv.setAttribute('class', 'card card-style');

    var cardTitle = document.createElement("h4");
    cardTitle.setAttribute('class', "card-title ml-2 mt-2")
    cardTitle.innerHTML = convertUTC2date(data.daily[i].dt);

    
    var iconCurrentDiv = document.createElement("div");
    var cardMoodIcon = document.createElement('img');
    const cardIconLink = 'http://openweathermap.org/img/wn/'+ data.daily[i].weather[0].icon + '.png';
    cardMoodIcon.setAttribute('src',cardIconLink);
    iconCurrentDiv.appendChild(cardMoodIcon);


    var cardTemp = document.createElement("p");
    cardTemp.setAttribute('class', "card-text ml-2");
    var temp = 'Temp : ' + data.daily[i].temp.day + "°F"
    cardTemp.innerText = temp;

    var cardWind = document.createElement("p");
    cardWind.setAttribute('class', "card-text ml-2");
    var wind = 'Wind : ' + data.daily[i].wind_speed + "MPH";
    cardWind.innerText = wind;

    var cardHumidity = document.createElement("p");
    cardHumidity.setAttribute('class','card-text ml-2');
    var humidity = "Humidity :" + data.daily[i].humidity + "%"
    cardHumidity.innerText = humidity;

    cardDiv.appendChild(cardTitle);
    cardDiv.appendChild(iconCurrentDiv);
    cardDiv.appendChild(cardTemp);
    cardDiv.appendChild(cardWind);
    cardDiv.appendChild(cardHumidity);
    cardTile.appendChild(cardDiv);
  }
}

//function to store recenta searches in localStorage
function recentSearches(recentlySearchedCity) {
  var localStorageString = JSON.parse(localStorage.getItem("city")); 
  arrEvent = []; 
  var cityInLS; 

  arrEvent = localStorageString;

  if (localStorageString) {
      cityInLS = arrEvent.findIndex(e => e == trimmedCityName);
  } else {
    arrEvent = [];
  }

  if (localStorageString && arrEvent.length == 11) {
      arrEvent.shift();
  } 

  if (!defaultCity) {
    if (cityInLS == -1 || (typeof(cityInLS) == 'undefined') ) {
      arrEvent.push(recentlySearchedCity);
      localStorage.setItem("city",JSON.stringify(arrEvent));
    }
  } 
 
  if (arrEvent.length) {
    populateRecentSearch(arrEvent); 
  }
}

//function to retrieve and build recently searched city 
function populateRecentSearch(arrEvent) {

  cityDiv.innerHTML = '';
  
  for (i=arrEvent.length-1;i>=0;i--){
    var citySearchButton = document.createElement('button');
    citySearchButton.textContent = arrEvent[i];
    citySearchButton.setAttribute('class',"btn btn-secondary rounded my-2");
    citySearchButton.setAttribute('id',"recentSearchedCity");
    cityDiv.appendChild(citySearchButton);
  }
}

//Initial  Pageload with plceholder City Seattle! if the user just loads the page the last searched value city's data will be displayed
window.onload = function () {
  var isItFirstTimeLoad = localStorage.getItem("city");
  var arrEvent = [];
  arrEvent = JSON.parse(isItFirstTimeLoad);
  if (isItFirstTimeLoad === null) {
    defaultCity = true;
    trimmedCityName = 'Seattle';
    getLatLon(trimmedCityName);
  } else {
    trimmedCityName = arrEvent[arrEvent.length-1];
    cityName.setAttribute ('placeholder',trimmedCityName)
    //console.log(trimmedCityName);
    getLatLon(trimmedCityName);
    populateRecentSearch(arrEvent);
  }
}

//Hnadling click events
submitBtn.addEventListener('click',callGeoCoding,false); 
cityDiv.addEventListener('click',callGeoCoding,false); 