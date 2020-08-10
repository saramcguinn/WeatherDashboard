var today = moment().format("MMM D, YYYY");
var cityArray = [];
var city;
var UVIndex;
var tempK;

initialize();

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

$("#citySearchBtn").on("click", function (event) {
    event.preventDefault();
    city = $("#cityInput").val().trim();
    cityArray.push(city);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    localStorage.setItem("lastCity", city);
    renderCityButtons();
    getAllWeather();
    $("#cityInput").val("");
})

$("#clearListBtn").on("click", function (event) {
    event.preventDefault();
    cityArray = [];
    $("#cityButtonArea").empty();
    localStorage.clear();
})

$(document).on("click", ".cityBtn", function (event) {
    event.preventDefault();
    city = $(this).attr("id");
    localStorage.setItem("lastCity", city);
    getAllWeather();
})

$(document).on("click", ".deleteBtn", function (event) {
    event.preventDefault();
    $(this).parent().remove();
    var index = cityArray.indexOf($(this).parent().attr("id"));
    cityArray.splice(index, 1);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    renderCityButtons();
    event.stopPropogation();
})

$(document).ajaxError(function () {
    $("#errorModal").modal();
    cityArray.splice((cityArray.length - 1), 1);
    localStorage.setItem("cities", JSON.stringify(cityArray));
    if (cityArray.length > 0) {
        localStorage.setItem("lastCity", cityArray[0]);
    }else {
        localStorage.setItem("lastCity", "Chicago");
    }
    renderCityButtons();
})

function renderCityButtons() {
    $("#cityButtonArea").empty();
    cityArray = JSON.parse(localStorage.getItem("cities"));
    for (var i = 0; i < cityArray.length; i++) {
        var newButton = $("<button>");
        var icon = $("<i>");
        icon.addClass("fas fa-window-close deleteBtn");
        newButton.text(cityArray[i]);
        newButton.addClass("cityBtn");
        newButton.addClass("btn");
        newButton.addClass("btn-dark");
        newButton.attr("id", cityArray[i]);
        newButton.append(icon);
        $("#cityButtonArea").append(newButton);
    }
}

function convertTemp(tempK) {
    return ((tempK - 273.15) * 1.80 + 32);
}

function rateUVIndex() {
    if (UVIndex < 3) {
        $("#currentUV").addClass("UVLow");
        $("#currentUV").removeClass("UVHigh");
        $("#currentUV").removeClass("UVModerate");
    } else if (UVIndex > 7) {
        $("#currentUV").addClass("UVHigh");
        $("#currentUV").removeClass("UVModerate");
        $("#currentUV").removeClass("UVLow");
    } else {
        $("#currentUV").addClass("UVModerate");
        $("#currentUV").removeClass("UVHigh");
        $("#currentUV").removeClass("UVLow");
    }
}

function getAllWeather() {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=354bfca1995e10eb413ecf3fc6ff2b3f";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        $("#cityName").text(response.name);
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var nextQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
        $.ajax({
            url: nextQueryURL,
            method: "GET"
        }).then(function (response) {
            tempK = response.current.temp;
            var currentIconCode = response.current.weather[0].icon;
            var currentIconURL = "https://openweathermap.org/img/w/" + currentIconCode + ".png";
            $("#currentIcon").attr("src", currentIconURL);
            $("#currentTemp").text(parseInt(convertTemp(tempK)));
            $("#currentHumidity").text(response.current.humidity);
            $("#currentWind").text(response.current.wind_speed);
            UVIndex = response.current.uvi;
            $("#currentUV").text(UVIndex);
            rateUVIndex();
            for (var i = 1; i < 6; i++) {
                var dailyIconCode = response.daily[i].weather[0].icon;
                var dailyIconURL = "https://openweathermap.org/img/w/" + dailyIconCode + ".png";
                $("#icon" + i).attr("src", dailyIconURL);
                $("#date" + i).text(moment().add(i, "d").format("M[/]D[/]YY"));
                tempK = (response.daily[i].temp.day);
                $("#forecast" + i + "Temp").text(parseInt(convertTemp(tempK)));
                $("#forecast" + i + "Hum").text(response.daily[i].humidity);
            }
        })
    });
}