import { verfiytoken } from "../utils.js";



export async function authMiddleware (req,res,next){
    

    const token = req.cookies.token || req.headers['authorized'].split(' ')[1]
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    const decoded = verfiytoken(token)
    if(!decoded){
        return res.status(401).json({message:"Unauthorized"})
    }
    req.user = decoded
    next()
}