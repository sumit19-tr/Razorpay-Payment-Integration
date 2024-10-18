const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    razorpay_order_id:String,
    razorpay_payment_id:String,
    razorpay_signature:String,
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('RazorpayPayments',PaymentSchema);
module.exports = mongoose.model('RazorpayPayments',PaymentSchema);