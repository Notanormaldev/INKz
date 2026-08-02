import { Router } from "express";
import User from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendAuthnotification } from "../config/mq.js";


const router = Router()

router.get('/google',passport.authenticate('google',{scope:['profile','email'],session:false}))

// ── GET /api/auth/me — verify JWT cookie and return user info ──────────────
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = jwt.verify(token, process.env.JWT)
        const user = await User.findById(decoded.id).select('-__v')
        if (!user) return res.status(401).json({ message: 'User not found' })

        res.json({
            id:          user._id,
            name:        user.name,
            email:       user.email,
            avatar:      user.avatar || user.profile_pic || null,
            googleId:    user.googleId,
        })
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
})



router.get('/google/callback', passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: "/", session: false }), async (req, res) => {
    try {

        const {id,displayName,emails,photos}=req.user;
        let user = await User.findOne({googleId:id})
       

        await sendAuthnotification({
            userID:id,
            email:emails[0].value,
            action:"google_login",
            timestamp: new Date()
        })
        
        if(!user){
            user = await User.create({
                googleId:id,
                name:displayName,
                email:emails[0].value,
                profile_pic:photos[0].value
            })
            await user.save();
        }

        const token = jwt.sign({id:user._id},process.env.JWT,{expiresIn:"1w"})
        
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',      // Required for cross-origin OAuth redirect flow
            maxAge: 7 * 24 * 60 * 60 * 1000  // 1 week in ms
        })

        // Redirect straight to the dashboard after successful login
        res.redirect("http://localhost:5173/projects")
        
    } catch (error) {
        console.log(error);
        res.redirect("http://localhost:5173")
    }
})


export default router;