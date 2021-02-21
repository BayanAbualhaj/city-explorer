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