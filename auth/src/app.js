import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cookies from 'cookie-parser'
import authrouter from './routes/user.route.js'

const app = express()

// Security headers
app.use(helmet())

// Rate limiter for authentication endpoints (50 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json())
app.use(cookies())
app.use(morgan("dev"))
app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email'],
}, (accesstoken, refreshtoken, profile, done) => {
    // console.log(profile);
    return done(null, profile)

}))

app.get('/auth/status/healthz',(req,res)=>{
    res.status(200).json({msg:"Auth ok"})
})

app.use('/api/auth', authLimiter, authrouter)
export default app 




