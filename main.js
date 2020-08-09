var today = moment().format("MMM D, YYYY");
var cityArray = [];
var city;
var cityID;
var UVIndex;
var tempK;

$("#currentDate").text(today);

$("#citySearchBtn").on("click", function(event) {
    event.preventDefault();
    var userInput = $("#cityInput").val().trim();
    cityArray.push(userInput);
    city = userInput;
    renderCityButtons();
    getCurrentWeather();
    getAllWeather();
})

$(document).on("click", ".cityBtn", function(event) {
    event.preventDefault();
    city = $(this).attr("id");
    getCurrentWeather();
    getAllWeather();
})

function renderCityButtons() {
    $("#cityButtonArea").empty();
    for (var i=0; i<cityArray.length; i++) {
        var newButton = $("<button>");
        newButton.text(cityArray[i]);
        newButton.addClass("cityBtn");
        newButton.attr("id", cityArray[i]);
        $("#cityButtonArea").append(newButton);
    }
}

function getCurrentWeather() {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        $("#cityName").text(response.name);
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        tempK = response.main.temp;
        // var tempF = convertTemp(tempK);
        $("#currentTemp").text(parseInt(convertTemp(tempK)));
        $("#currentHumidity").text(response.main.humidity);
        $("#currentWind").text(response.wind.speed);

        var UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=354bfca1995e10eb413ecf3fc6ff2b3f&lat=" + lat + "&lon=" + lon;
        $.ajax({
            url: UVqueryURL,
            method: "GET"
        }).then(function(response){
            UVIndex = response.value;
            $("#currentUV").text(UVIndex);
            rateUVIndex();
        })
    });
}

function convertTemp(tempK) {
    return((tempK - 273.15) * 1.80 + 32);
}

function rateUVIndex() {
    if (UVIndex < 3) {
        $("#currentUV").addClass("UVLow");
        $("#currentUV").removeClass("UVHigh");
        $("#currentUV").removeClass("UVModerate");
    }else if (UVIndex > 7) {
        $("#currentUV").addClass("UVHigh");
        $("#currentUV").removeClass("UVModerate");
        $("#currentUV").removeClass("UVLow");
    }else {
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
    }).then(function(response) {
        // $("#cityName").text(response.name);
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var nextQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
        $.ajax({
            url: nextQueryURL,
            method: "GET"
        }).then(function(response){
            for (var i=1; i<6; i++) {
                // date = moment().add(i,"d");
                $("#date"+i).text(moment().add(i,"d").format("M[/]D[/]YY"));
                tempK = (response.daily[i].temp.day);
                $("#forecast"+i+"Temp").text(parseInt(convertTemp(tempK)));
                $("#forecast"+i+"Hum").text(response.daily[i].humidity);
            }
        })
    });
}