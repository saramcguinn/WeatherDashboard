//Code will run only after document is ready
$(document).ready(function () {

    /***********************************************************************************************
    DECLARE GLOBAL VARIABLES & INITIALIZE PAGE
    ***********************************************************************************************/
    var today = moment().format("MMM D, YYYY");
    var cityArray = [];
    var city;
    var UVIndex;
    var tempK;

    initialize();

    /***********************************************************************************************
    DEFINE FUNCTIONS
    ***********************************************************************************************/

    //Initializes page w/ current date & city buttons from local storage, if applicable
    function initialize() {
        $("#currentDate").text(today);
        var lastCity = localStorage.getItem("lastCity");
        if (lastCity !== null) {
            city = lastCity
        } else {
            city = "Chicago";
        }
        var storedCities = JSON.parse(localStorage.getItem("cities"));
        if (storedCities !== null) {
            cityArray = storedCities;
            renderCityButtons();
        }
        getAllWeather();
    }

    //Loops through array of cities in local storage & dynamically creates a city button w/ 'close/delete' icon
    function renderCityButtons() {
        $("#cityButtonArea").empty();
        cityArray = JSON.parse(localStorage.getItem("cities"));
        for (var i = 0; i < cityArray.length; i++) {
            var newButton = $("<button>");
            var icon = $("<i>");
            icon.addClass("fas fa-window-close deleteBtn");
            newButton.text(cityArray[i]);
            newButton.addClass("cityBtn btn btn-dark btn-lg");
            newButton.attr("id", cityArray[i]);
            newButton.append(icon);
            $("#cityButtonArea").append(newButton);
        }
    }

    //Converts temperature from Kelvin to Fahrenheit
    function convertTemp(tempK) {
        return ((tempK - 273.15) * 1.80 + 32);
    }

    //Adds class based on UV index level, which color codes the span via css
    function rateUVIndex() {
        if (UVIndex < 3) {
            $("#currentUV").addClass("UVLow");
            $("#currentUV").removeClass("UVHigh UVModerate");
        } else if (UVIndex > 7) {
            $("#currentUV").addClass("UVHigh");
            $("#currentUV").removeClass("UVModerate UVLow");
        } else {
            $("#currentUV").addClass("UVModerate");
            $("#currentUV").removeClass("UVHigh UVLow");
        }
    }

    //Makes ajax calls and renders select response information to the DOM
    function getAllWeather() {
        //First ajax call gets name, latitude, and longitude of city that user searched for
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            $("#cityName").text(response.name);
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            //Second ajax call uses lat/lon from first call to get the rest of the current & future forecast information
            var nextQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
            $.ajax({
                url: nextQueryURL,
                method: "GET"
            }).then(function (response) {
                //Icon for current weather:
                var currentIconCode = response.current.weather[0].icon;
                var currentIconURL = "https://openweathermap.org/img/w/" + currentIconCode + ".png";
                $("#currentIcon").attr("src", currentIconURL);
                //Current temperature:
                tempK = response.current.temp;
                $("#currentTemp").text(parseInt(convertTemp(tempK)));
                //Current humidity:
                $("#currentHumidity").text(response.current.humidity);
                //Current wind speed:
                $("#currentWind").text(response.current.wind_speed);
                //Current UV index:
                UVIndex = response.current.uvi.toFixed(2);
                $("#currentUV").text(UVIndex);
                rateUVIndex();
                //Loop through forecast objects in response to get/render dates, icons, temps, and humidities
                for (var i = 1; i < 6; i++) {
                    $("#date" + i).text(moment().add(i, "d").format("M[/]D[/]YY"));
                    var dailyIconCode = response.daily[i].weather[0].icon;
                    var dailyIconURL = "https://openweathermap.org/img/w/" + dailyIconCode + ".png";
                    $("#icon" + i).attr("src", dailyIconURL);
                    tempK = (response.daily[i].temp.day);
                    $("#forecast" + i + "Temp").text(parseInt(convertTemp(tempK)));
                    $("#forecast" + i + "Hum").text(response.daily[i].humidity);
                }
            })
        });
    }

    /***********************************************************************************************
    ADD EVENT LISTENERS
    ***********************************************************************************************/

    //Search button: saves city to array in local storage & creates buttons
    $("#citySearchBtn").on("click", function (event) {
        event.preventDefault();
        var input = $("#cityInput").val();
        //Strangely, searching for gibberish that begins with a comma returns an actual city result, so the if/else prevents that odd behavior
        if (input.charAt(0) === ",") {
            $("#errorModal").modal();
            $("#cityInput").val("");
        } else {
            city = $("#cityInput").val().trim();
            cityArray.push(city);
            localStorage.setItem("cities", JSON.stringify(cityArray));
            localStorage.setItem("lastCity", city);
            renderCityButtons();
            getAllWeather();
            $("#cityInput").val("");
        }
    })

    //Clear list button: clears list & clears local storage
    $("#clearListBtn").on("click", function (event) {
        event.preventDefault();
        cityArray = [];
        $("#cityButtonArea").empty();
        localStorage.clear();
    })

    //City button: re-renders city weather information
    $(document).on("click", ".cityBtn", function (event) {
        event.preventDefault();
        city = $(this).attr("id");
        localStorage.setItem("lastCity", city);
        getAllWeather();
    })

    //Delete button (little 'x' within city button): deletes city from list & from city array in local storage
    $(document).on("click", ".deleteBtn", function (event) {
        event.preventDefault();
        $(this).parent().remove();
        var index = cityArray.indexOf($(this).parent().attr("id"));
        cityArray.splice(index, 1);
        localStorage.setItem("cities", JSON.stringify(cityArray));
        renderCityButtons();
        event.stopPropogation();
    })

    /*Ajax error message: if user submits blank search, or if city can't be found, displays modal to user,
      removes item from array/LS, and re-renders buttons, effectively removing the blank/gibberish button */
    $(document).ajaxError(function() {
        $("#errorModal").modal();
        cityArray.splice((cityArray.length - 1), 1);
        localStorage.setItem("cities", JSON.stringify(cityArray));
        if (cityArray.length > 0) {
            localStorage.setItem("lastCity", cityArray[0]);
        } else {
            localStorage.setItem("lastCity", "Chicago");
        }
        renderCityButtons();
    })
})