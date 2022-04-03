
var submitBtn = document.getElementById("submitBtn");
var cityName = document.getElementById("searchCitybyName");
var cityDiv = document.getElementById('recentSearch');
var currWeatherDiv = document.getElementById("current-weather");
var trimmedCityName;
var weatherAPIKey = '&appid=4bb64f9765f05da214fa658d7da7c6c8'
var geoBaseURL = 'http://api.openweathermap.org/geo/1.0/direct?q=';
var forecastURL = 'https://api.openweathermap.org/data/2.5/onecall?lat='


function callGeoCoding(event) {
    event.preventDefault();
    event.stopPropagation();

   // console.log('in geocoding');
    // console.log(event.target.id, event.target.innerText);


    if (event.target.id == 'submitBtn') {
      trimmedCityName = cityName.value.trim();
      cityName.value = '';
      if(trimmedCityName){
        recentSearches(trimmedCityName)
      };

    } else if (event.target.id == 'recentSearchedCity') {
      trimmedCityName = event.target.innerText;
    }

    // console.log(trimmedCityName);
    if (trimmedCityName) {
      getLatLon(trimmedCityName);
    }
    
}

function getLatLon(trimmedCityName) {
    var arrLatLon = [];
    georeqURL = geoBaseURL + trimmedCityName + '&limit=5' +  weatherAPIKey;
    // console.log(georeqURL);
    fetch(georeqURL)
    .then(function (response) {
      if (response.ok) {
        //console.log(response);
        response.json().then(function (data) {
          var index = data.findIndex(e => e.country === 'US');
          if (index !== -1) {
              //console.log(data[index].lat, data[index].lon);
              getWeatherData(data[index].lat,data[index].lon);
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


function getWeatherData(arrLat, arrLon) {

  var exclusion = '&exclude=minutely,hourly';
  //console.log(arrLat,arrLon);
  forecastReqURL = forecastURL + arrLat + "&lon=" + arrLon + exclusion + weatherAPIKey + '&units=imperial';
  //console.log(forecastURL);

  fetch(forecastReqURL)
  .then(function (response) {
    if (response.ok) {
      //console.log(response);
      response.json().then(function (data) {
        console.log(data);
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

  if (data.current.uvi < 1) {
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

function recentSearches(recentlySearchedCity) {
  var keyID = localStorage.length;
  console.log(keyID);
  if (keyID == 12) {
    console.log ('inside 8');
    for (i=0; i<keyID;i++){
      keyPlus1 = i + 1; 
      cityPlus1= localStorage.getItem(keyPlus1)
      localStorage.setItem(i,cityPlus1)
    }
    localStorage.setItem(keyID,recentlySearchedCity);
  }  else if (keyID >= 0 && keyID < 12) {
    console.log ('inside < 8');
    localStorage.setItem(keyID,recentlySearchedCity)  
  };
  populateRecentSearch();
}

function populateRecentSearch() {
  //create recently searched buttons

  totalCitySeraches = localStorage.length; 
  console.log('before building recent search ' + totalCitySeraches);
  cityDiv.innerHTML = '';
  for (i=totalCitySeraches;i>0;i--){
    var citySearchButton = document.createElement('button');
    citySearchButton.textContent = localStorage.getItem(i-1);
    citySearchButton.setAttribute('class',"btn btn-secondary rounded my-2");
    citySearchButton.setAttribute('id',"recentSearchedCity");
    cityDiv.appendChild(citySearchButton);
  }
}

//Initial  Pageload with plceholder City Seattle! 
window.onload = function () {
  console.log("in windows Onload")
  if (localStorage.length <=0) {
    trimmedCityName = 'Seattle';
    getLatLon(trimmedCityName);
  } else {
    trimmedCityName = localStorage.getItem(localStorage.length-1);
    console.log(trimmedCityName);
    getLatLon(trimmedCityName);
    populateRecentSearch()
  }
}
submitBtn.addEventListener('click',callGeoCoding,false); 
cityDiv.addEventListener('click',callGeoCoding,false); 