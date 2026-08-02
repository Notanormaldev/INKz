import { Router } from "express";
import { User, Application } from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendAuthnotification } from "../config/mq.js";

const router = Router()

const ADMIN_EMAIL = 'harshpatelpc20051@gmail.com'

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

// ── GET /api/auth/me — verify JWT cookie and return user info ──────────────
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = jwt.verify(token, process.env.JWT)
        let user = await User.findById(decoded.id).select('-__v')
        if (!user) return res.status(401).json({ message: 'User not found' })

        const isAdmin = user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()

        if (isAdmin && (user.role !== 'admin' || user.plan !== 'unlimited')) {
            user.role = 'admin'
            user.plan = 'unlimited'
            await user.save()
        }

        res.json({
            id:          user._id,
            name:        user.name,
            email:       user.email,
            avatar:      user.avatar || user.profile_pic || null,
            googleId:    user.googleId,
            role:        isAdmin ? 'admin' : (user.role || 'user'),
            plan:        isAdmin ? 'unlimited' : (user.plan || 'free')
        })
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
})

// ── POST /api/auth/logout — clear auth cookie ─────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('token', { sameSite: 'lax', httpOnly: true })
    return res.status(200).json({ message: 'Logged out successfully' })
})

// ── POST /api/auth/apply — submit early access application ───────────────
router.post('/apply', async (req, res) => {
    try {
        const { name, email, github, experience, usecase } = req.body
        if (!name || !email || !usecase) {
            return res.status(400).json({ message: 'Name, email, and usecase are required' })
        }

        const application = await Application.create({
            name,
            email,
            github,
            experience,
            usecase
        })

        return res.status(201).json({ message: 'Application submitted successfully', application })
    } catch (err) {
        console.error('[APPLY ERROR]', err)
        return res.status(500).json({ message: 'Failed to submit application' })
    }
})

// ── GET /api/auth/admin/stats — Admin panel data ──────────────────────────
router.get('/admin/stats', async (req, res) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = jwt.verify(token, process.env.JWT)
        const currentUser = await User.findById(decoded.id)
        
        if (!currentUser || currentUser.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            return res.status(403).json({ message: 'Forbidden: Admin access only' })
        }

        // 1. All registered users
        const allUsers = await User.find().select('-__v').sort({ createdAt: -1 })

        // 2. Early access applications
        const applications = await Application.find().sort({ createdAt: -1 })

        // 3. Unlimited plan users (including admin)
        const unlimitedUsers = allUsers.filter(u => u.plan === 'unlimited' || u.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim())

        return res.status(200).json({
            admin: {
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                avatar: currentUser.avatar || currentUser.profile_pic,
                role: 'admin',
                plan: 'unlimited'
            },
            totalUsersCount: allUsers.length,
            users: allUsers,
            applicationsCount: applications.length,
            applications: applications,
            unlimitedUsersCount: unlimitedUsers.length,
            unlimitedUsers: unlimitedUsers
        })
    } catch (err) {
        console.error('[ADMIN STATS ERROR]', err)
        return res.status(500).json({ message: 'Error fetching admin data' })
    }
})

// ── POST /api/auth/admin/approve-app — Approve application & grant unlimited 
router.post('/admin/approve-app', async (req, res) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = jwt.verify(token, process.env.JWT)
        const currentUser = await User.findById(decoded.id)
        if (!currentUser || currentUser.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
            return res.status(403).json({ message: 'Forbidden: Admin access only' })
        }

        const { applicationId, email } = req.body

        if (applicationId) {
            await Application.findByIdAndUpdate(applicationId, { status: 'approved' })
        }

        if (email) {
            await User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { plan: 'unlimited' })
        }

        return res.status(200).json({ message: 'Application approved & Unlimited plan granted' })
    } catch (err) {
        return res.status(500).json({ message: 'Failed to approve application' })
    }
})

router.get('/google/callback', passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: "/", session: false }), async (req, res) => {
    try {
        const { id, displayName, emails, photos } = req.user;
        const userEmail = emails[0].value.toLowerCase().trim();
        let user = await User.findOne({ googleId: id })

        await sendAuthnotification({
            userID: id,
            email: userEmail,
            action: "google_login",
            timestamp: new Date()
        })

        const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase().trim()

        if (!user) {
            user = await User.create({
                googleId: id,
                name: displayName,
                email: userEmail,
                avatar: photos[0]?.value || null,
                role: isAdmin ? 'admin' : 'user',
                plan: isAdmin ? 'unlimited' : 'free'
            })
            await user.save();
        } else {
            if (isAdmin) {
                user.role = 'admin'
                user.plan = 'unlimited'
                await user.save()
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT, { expiresIn: "1w" })

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.redirect("http://localhost:5173/projects")

    } catch (error) {
        console.log(error);
        res.redirect("http://localhost:5173")
    }
})

export default router;