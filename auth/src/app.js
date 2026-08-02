import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cookies from 'cookie-parser'
import authrouter from './routes/user.route.js'

const app = express()

// Trust reverse proxy (Kubernetes Nginx Ingress)
app.set('trust proxy', true)

// Security headers
app.use(helmet({
  contentSecurityPolicy: false
}))

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
    return done(null, profile)
}))

app.get('/auth/status/healthz', (req, res) => {
    res.status(200).json({ msg: "Auth ok" })
})

app.use('/api/auth', authrouter)

export default app
