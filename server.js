'use strict';

let express= require('express');
const cors = require('cors');
let superagent = require('superagent');


let app= express();
app.use(cors());
const pg=require('pg'); 
require('dotenv').config();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

const PORT =process.env.PORT;

// ==================routes -endpoints========================
app.get('/location',handleLocation);
app.get('/weather',handleWeather);
app.get('/parks',handlePark);
app.get('*',handle404);


//=======================Handler404==============================


function handle404(req,res){
    res.status(404).send('404 .... this page cannot be found');
}


//======================================================Location==========================================

function handleLocation(req,res){

    let searchQuery= req.query.city;
    checkDataBase(searchQuery, res);
}

// ========================get data ============================

function getLocationData(searchQuery,res){
    const query ={
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit:1,
        format:'json'
    };

    let url ='https://eu1.locationiq.com/v1/search.php';
    return superagent.get(url).query(query).then(data=>{
        console.log(data.body);
        try{
            let longitude=data.body[0].lon;
            let latitude=data.body[0].lat;
            let name=searchQuery;
            let formatName=data.body[0].display_name;

            let dbQuery =`INSERT INTO cities(cityName,formatName,lon,lat) VALUES ($1,$2,$3,$4)`;
            console.log(longitude);
            console.log(latitude);
            console.log(name);
            console.log(formatName);
            let safeValues=[name,formatName,longitude,latitude];

            client.query(dbQuery,safeValues).then(data=>{
                console.log(data);
                let resObject= new CityLocation(searchQuery,name,latitude,longitude);
                console.log(resObject)
                return resObject;
                ;
            });
        }catch(error){
            res.status(500).send('Status :500 , Sorry, something went wrong');
        }
    }).catch(error=>{
        res.status(500).send(`Status :500 , Sorry, something acourrced  + ${error}`);   
    });
}

//==================Function check database==========

function checkDataBase(searchQuery,res){
    // re-code on rowsCount base ...... 
    client.query(`SELECT * FROM cities WHERE cityName='${searchQuery}'`).then(data=>{
        if (data.rows.length==0){
            getLocationData(searchQuery,res).then(data=>{
                res.status(200).send(data);
            });
        }else {
            console.log(data.rows);
            // in order to be lent creat var = data.rows[0]; in order to make it as a object to pass in the constructor
            let resObject= new CityLocation(data.rows[0].cityname,data.rows[0].formatname,data.rows[0].lat,data.rows[0].lon);
            console.log('else ',resObject);
            res.status(200).send(resObject);
        }
    });
    
}

//=================Constructor========================
// we should re-name the table columns too the properties of the constructor 
//to base only the object it-self to the constructor then obj.property 

function CityLocation(searchQuery,displayName,lat,lon){
    this.search_query=searchQuery;
    this.formatted_query=displayName;
    this.latitude=lat;
    this.longitude=lon;

}

//====================================================== Weather ====================================================


//===========handeler================

function handleWeather(req, res){
  getWeatherData(req, res).then(data=>{
      res.status(200).send(data);
  });

}
//============Get data===========

function getWeatherData(req,res){
    // console.log(req.query);
    let url='https://api.weatherbit.io/v2.0/forecast/daily';
    const query={
            key:process.env.WEATHER_API_KEY,
            city:req.query.search_query
        }

    return superagent.get(url).query(query).then(data=>{
        
        try{
            // console.log(data.body.data[0].weather.description);
            // console.log(data.body);

        let weatherArray=[]; 
        data.body.data.map((value)=>{
            // console.log(value);
            let forcast= value.weather.description;
            let time = value.datetime;
            let x = turnDate(time);

            let weatherObject= new Weather(forcast,x);
            weatherArray.push(weatherObject);
            
        });
        return weatherArray;
        } catch(error){
            res.status(500).send(`Status :500 , Sorry, something went wrong  + ${error}`);
        }
    }).catch(error=>{
        res.status(500).send(`Status :500 , Sorry, something went wrong  + ${error}`);   
    });
    
}


//===============Turn Date fillter=================

function turnDate(day){
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']; 

    const days = [ 'Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'];
    
    const d = new Date(day);
    const year = d.getFullYear() ;
    const date = d.getDate() ;

    const monthName = months[d.getMonth()];
    // console.log(monthName);

    const dayName = days[d.getDay()];

    const formatted = `${dayName}, ${date} ${monthName} ${year}`;
    // console.log(formatted);
    return formatted;

}


function Weather(forcast,time){
    this.forecast=forcast;
    this.time=time;

}



//==============================================================Park=================================================


//==================Habdler=================

function handlePark(req, res){
    getParkData(req, res).then(data=>{
        res.status(200).send(data);
    });
  
}


//=================Get Data================


function getParkData(req,res){
    // console.log(req.query);
    let url='https://developer.nps.gov/api/v1/parks';

    const query={
            api_key:process.env.PARKS_API_KEY,
            q:req.query.search_query,
        };

    return superagent.get(url).query(query).then(data=>{
        try{
            // console.log(data.body.data[0].entranceFees[0].cost);
            
            let parksArray=[]; 
            data.body.data.map((value)=>{
            let name=value.fullName;
            let parkURL=value.url;
            let desscreption=value.description;
            let fee=value.entranceFees[0].cost;
            let address=`"${value.addresses[0].line1}"  "${value.addresses[0].city}" "${value.addresses[0].stateCode}" "${value.addresses[0].postalCode}"`
            
            //first location 

            let parksObject= new Parks(name,address,fee,desscreption,parkURL);
            parksArray.push(parksObject);
            
        });
        return parksArray;
        }catch(error){
            res.status(500).send(`an error has been detected typre 500 ${error}`);
        }
    }).catch(error=>{
        res.status(500).send(`Status :500 , Sorry, something went wrong  + ${error}`);
    });
}

//==========Constructor===============

function Parks(name,address,fee,description,url){
    this.name=name;
    this.address=address;
    this.fee=fee;
    this.description=description;
    this.url=url;

}


//======================================


client.connect().then(()=>{
    app.listen(PORT,()=>{
    console.log('this app is listening on port 3000');
    });
}).catch(error=>{
    console.log('an error occurred while connecting to database '+error);
});

// re-factor all the error from all function 
//