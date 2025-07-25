const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const USER = mongoose.model("USER");
const jwt = require('jsonwebtoken');
const { Jwt_secret } = require('../keys.js');
const requireLogin = require('../middlewares/requireLogin.js');
// Test route
// router.get('/', (req, res) => {
//     res.send("hello middleware");
// });



// Signup route
router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !email || !username || !password) {
        return res.status(422).json({ error: "Please add all the fields" });
    }

    try {
        const savedUser = await USER.findOne({ $or: [{ email }, { username }] });
        if (savedUser) {
            return res.status(422).json({ error: "User already exists with that email or username" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new USER({
            name,
            email,
            username,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: "Registered Successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signin route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" });
    }

    try {
        const savedUser = await USER.findOne({ email });
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid email" });
        }

        const match = await bcrypt.compare(password, savedUser.password);
        if (match) {
            // return res.status(200).json({ message: "Signed in Successfully" });
            const token = jwt.sign({_id:savedUser.id}, Jwt_secret)
            const {_id, name, email, username, photo} = savedUser;
            res.json({token, user:{_id, name, email, username, photo}});

            console.log({token, user:{_id, name, email, username}});    
        } else {
            return res.status(422).json({ error: "Invalid password" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/googleLogin', async (req, res) => {
    const { email_verified, email, name, clientId, username, photo } = req.body;

    if (!email_verified) {
        return res.status(400).json({ error: "Email not verified by Google" });
    }

    if (!email || !clientId || !name || !username) {
        return res.status(422).json({ error: "Missing required fields from Google" });
    }

    try {
        const savedUser = await USER.findOne({ email });

        if (savedUser) {
            const token = jwt.sign({ _id: savedUser._id.toString() }, Jwt_secret);
            return res.json({
                token,
                user: {
                    _id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    username: savedUser.username
                }
            });
        } else {
            const password = email + clientId;
            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = new USER({
                name,
                email,
                username,
                password: hashedPassword,
                photo
            });

            const user = await newUser.save();
            const token = jwt.sign({ _id: user._id.toString() }, Jwt_secret);

            return res.json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username
                }
            });
        }
    } catch (err) {
        console.error("Google Login Error:", err.message, err.stack);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
