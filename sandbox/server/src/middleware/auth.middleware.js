import { verfiytoken } from "../utils.js";

export async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['authorized']
    const token = req.cookies?.token || (authHeader ? authHeader.split(' ')[1] : null)

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const decoded = verfiytoken(token)
    if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    req.user = decoded
    next()
}