import jwt from 'jsonwebtoken';


export function verfiytoken(token){
    try {
        return jwt.verify(token,process.env.JWT)
    } catch (error) {
        console.log("Token Verification Error",error);
        return null
    }
}


