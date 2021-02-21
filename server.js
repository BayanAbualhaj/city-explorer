'use strict';

let express= require('express');
const cors = require('cors');

let app= express();
app.use(cors());

//// this line is to order to use it every where 
require('dotenv').config();

const PORT =process.env.PORT;

app.listen(PORT,()=>{
    console.log('this app is listening on port 3000');
})

// routes -endpoints

app.get('/location',handleLocation);

// app.get('/weather',handleWeather);


// great a call back function in order to be lent 

function handleLocation(req,res){

    let searchQuery= req.query.city;
    console.log(searchQuery);
    // I'm passing here the searchQuery to send the requst to the get location then in order to git the data we will make the response 
    let locationObjects =getLocationData(searchQuery);

    res.status(200).send(locationObjects);
    
}

// get data ========

function getLocationData(seaerchQuery){
    ///this hoiw we came into the the json files 
    let location = require('./data/location.json');
    
    /// because the location is an array i want to access the first index 
    /// and because the first index is an object we use .lat .lon
    let longitude=location[0].lon;
    let latintude=location[0].lat;
    let displayName=location[0].display_name;
    
    let responseObject = new CityLocation(seaerchQuery,displayName,latintude,longitude);

    return responseObject;
    // return to get the value to used in the handle because if I didn't do this there is will be no value 
}


// constructor to order the data 

function CityLocation(searchQuery,displayName,lat,lon){
    this.search_query=searchQuery;
    this.formatted_query=displayName;
    this.latitude=lat;
    this.longitude=lon;

}

/// Weather ===============================

app.get('/weather',handleWeather);

function handleWeather(req, res){
    
    let weatherObjects= getWeatherData();

    res.status(200).send(weatherObjects);
}


function getWeatherData(){
    let weather=require('./data/weather.json');
    let weatherArray=[];
    let timeArray = weather.data
    for (let i = 0; i < timeArray.length; i++) {
        let forcast= timeArray[i].weather.description;
        let time = timeArray[i].datetime;
        let x = turnDate(time);

        let weatherObject= new Weather(forcast,x);
        weatherArray.push(weatherObject);
    }
    return weatherArray;


}



// let items = value.slice(value.indexOf(' ')+1, value.length);
// list.push(items.slice(items.indexOf(" ")+1, items.length));

function turnDate(day){
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']; 

    const days = [ 'Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'];
    
    const d = new Date(day);
    const year = d.getFullYear() ;
    const date = d.getDate() ;

    const monthName = months[d.getMonth()];
    console.log(monthName);

    const dayName = days[d.getDay()];

    const formatted = `${dayName}, ${date} ${monthName} ${year}`;
    console.log(formatted);
    return formatted;

}


function Weather(forcast,time){
    this.forecast=forcast;
    this.time=time;


}


