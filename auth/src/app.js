import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import cookies from 'cookie-parser'




const app =express()


export default app 




