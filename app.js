let dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const db = require('./db');
const port = process.env.PORT || 5000 ;
const cors = require('cors');
app.use(cors());

let dotenv = require("dotenv");
dotenv.config();

//* Available Route 
app.get('/', (req, res) => {
    res.send('Razorpay Payment Gateway Using React And Node Js ')
})

const PaymentController = require('./Controller/PaymentController');
app.use('/api/payment',PaymentController);

app.listen(port,() => {
    console.log(`Example app listening at http://localhost:${port}`);
})