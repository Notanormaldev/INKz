import { Router } from "express";
import User from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendAuthnotification } from "../config/mq.js";


const router = Router()

router.get('/google',passport.authenticate('google',{scope:['profile','email'],session:false}))

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
        res.cookie("token",token,{httpOnly:true})
        res.redirect("/")
        
    } catch (error) {
        console.log(error);
        res.redirect("/login")
    }
})


export default router;