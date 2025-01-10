
import express from "express"
import OTPModel from "../model/otp.model.js"
import { createTransport } from "nodemailer";
import dotenv from "dotenv";
import pkg from 'bcryptjs';

const { hash, compare } = pkg;


dotenv.config();
console.log('Email:', process.env.EMAIL);
console.log('Password:', process.env.PASSWORD ? '****' : 'Not set');
const authRoute = express.Router()
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}


const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendMail = async (receiverEmail, subject, body) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: receiverEmail,
        subject: subject,
        html: body
    });
}


async function resendOtp(req, res, email) {
    try {
        await OTPModel.deleteMany({ email: email })

        const otp = generateOTP()
        const hashedOtp = await hash(otp, 10)

        const newOtp = new OTPModel({ email: email, otp: hashedOtp, expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME) })
        await newOtp.save()

        await sendMail(
            email,
            `Vérification OTP pour votre compte Educ Sensei`,
            `Votre mot de passe à usage unique (OTP) pour la vérification de votre compte Educ Sensei est : <b>${otp}</b>.</br>Veuillez ne pas partager cet OTP avec quiconque pour des raisons de sécurité.`
        );

        res.status(201).json({ email: email })
    } catch (error) {
        res.status(500).json({ 'message': "Some error occured while resending otp, please try again later" })
        console.log(error);
    }
}


const verifyOtp = async (req, res) => {
    try {
        // checks if otp exists by that user id
        const isOtpExisting = await OTPModel.findOne({ email: req.body.email })

        // if otp does not exists then returns a 404 response
        if (!isOtpExisting) {
            console.log("Otp not found")
            return res.status(404).json({ message: 'Otp not found' })
        }

        // checks if the otp is expired, if yes then deletes the otp and returns response accordinly
        if (isOtpExisting.expiresAt < new Date()) {
            await OTPModel.findByIdAndDelete(isOtpExisting._id)
            console.log("Otp has been expired")
            return res.status(400).json({ message: "Otp has been expired" })
        }
        let otp = req.body.code
        // checks if otp is there and matches the hash value then updates the user verified status to true and returns the updated user
        if (isOtpExisting && (await compare(otp, isOtpExisting.otp))) {
            await OTPModel.findByIdAndDelete(isOtpExisting._id)
            return res.status(200).json({ message: "opt verified" })
        }
        // in default case if none of the conidtion matches, then return this response
        return res.status(400).json({ message: 'Otp is invalid or expired' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Some Error occured" })
    }
}

authRoute.post("/resend-otp", async (req, res) => {
    try {
        resendOtp(req, res, req.body.email)
    } catch (error) {
        return res.status(404).json({ "message": "User not found" })
    }
})

authRoute.post("/verify-otp", async (req, res) => {
    try {
        verifyOtp(req, res)
    } catch (error) {
        return res.status(404).json({ "message": "User not found" })
    }
})

export default authRoute;