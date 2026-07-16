import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cookies from 'cookie-parser'




const app =express()

app.use(express.json())
app.use(cookies())
app.use(morgan("dev"))

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback",
},(accesstoken,refreshtoken,profile,done)=>{
    // console.log(profile);
    return  done(null,profile)

}))

export default app 




