const express = require('express');
const Razorpay = require("razorpay");
const crypto = require('crypto');
const bodyParser = require("body-parser");//to post call

let dotenv = require("dotenv");
const payment = require('../models/payment');
dotenv.config();

const PaymentRouter = express.Router();
PaymentRouter.use(bodyParser.urlencoded({ extended: true }));
PaymentRouter.use(bodyParser.json());

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,    
    key_secret: process.env.RAZORPAY_SECRET
});

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);

// ROUTE 1 : Create Order Api Using POST Method http://localhost:5000/api/payment/order
PaymentRouter.post('/order', (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        }

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.status(200).json({ data: order });
            console.log(order)
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
})


// ROUTE 2 : Create Verify Api Using POST Method http://localhost:5000/api/payment/verify
PaymentRouter.post('/verify', async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // console.log("req.body", req.body);

    try {
        // Create Sign
        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        // Create ExpectedSign
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log(razorpay_signature === expectedSign);

        // Create isAuthentic
        const isAuthentic = expectedSign === razorpay_signature;

        // Condition 
        if (isAuthentic) {
            const newPayment = new payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            // Save Payment 
            await newPayment.save();

           // Redirect to the given URL with query parameters
        //    const status = "ordered";
        //    const redirectUrl = `http://localhost:3000/viewBooking?status=${status}&ORDERID=${razorpay_order_id}&date=${Date.now()}&PAYMENTID=${razorpay_payment_id}`;
        //    res.redirect(redirectUrl);    

            // Send Message 
            res.json({
                message: "Payement Successfully"
            });
        }
        else {
            // If the signature is not authentic, send a bad request response
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
})

module.exports = PaymentRouter;