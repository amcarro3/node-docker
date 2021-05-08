const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
    try {
        const {username, password} = req.body
        const hashPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            password: hashPassword
        });
        req.session.user = newUser;
        res.status(201).json({
            status: "success",
            data: {
                user: newUser
            }
        })
    } catch (e){
        res.status(400).json({
            status: "fail",
        });
    }
}

exports.login = async (req, res) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username});

        if(!user) {
            return res.status(404).json({
                status: "fail",
                message: "user not found"
            })
        }
        const valid = await bcrypt.compare(password, user.password);
        if(valid) {
            req.session.user = user;
            res.status(201).json({
                status: "success",
            })
        } else {
            res.status(401).json({
                status: "fail",
                message: "invalid credentials"
            })
        }
    } catch (e){
        res.status(400).json({
            status: "fail",
        });
    }
}