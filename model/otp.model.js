import mongoose, { model } from "mongoose"
const { Schema } = mongoose

const otpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
})



const OTPModel = mongoose.model("OTP", otpSchema)
export default OTPModel;