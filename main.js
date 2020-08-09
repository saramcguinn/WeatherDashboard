var cityArray = [];

$("#citySearchBtn").on("click", function(event) {
    event.preventDefault();
    var userInput = $("#cityInput").val().trim();
    cityArray.push(userInput);
    renderCityButtons();
    getCurrentWeather();
})

$(document).on("click", ".cityBtn", function(event) {
    event.preventDefault();
    console.log("city button clicked");
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
    var city = $("#cityInput").val().trim();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=354bfca1995e10eb413ecf3fc6ff2b3f";
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        $("#cityName").text(city);
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        var tempK = response.main.temp;
        var tempF = (tempK - 273.15) * 1.80 + 32;
        $("#currentTemp").text(parseInt(tempF));
        $("#currentHumidity").text(response.main.humidity);
        $("#currentWind").text(response.wind.speed);

        var UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=354bfca1995e10eb413ecf3fc6ff2b3f&lat=" + lat + "&lon=" + lon;
        $.ajax({
            url: UVqueryURL,
            method: "GET"
        }).then(function(response){
            $("#currentUV").text(response.value);
        })
    });

}