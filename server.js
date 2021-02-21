'use strict';

let express= require('express');

let app= express();

//// this line is to order to use it every where 
require('dotenv').config();

const PORT =process.env.PORT;

app.listen(PORT,()=>{
    console.log('this app is listening on port 3000');
})
