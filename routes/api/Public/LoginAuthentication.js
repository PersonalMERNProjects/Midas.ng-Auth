const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')


//User Model
const User = require('../../../models/User')
const Parent = require('../../../models/Parent')

//@route POST api/auth
//@desc Authenticate/login user
//@access Public

router.post('/', (req, res) => {
    const { email, password } = req.body;

    //simple validation to ensure all fields are filled
    if ( !email || !password) {
        return res.status(400).json({
            message: 'please enter all fields',
            status_code: 400
        })
    }
    // { $or: [{ 'email': credential }, { 'username': credential }] } query for login that supports bth username and email as login credential
    // checking for existing user
    User.findOne({ email: email })
    .then((user) => {
        if (!user) {
            return res.status(400).json({
                message: 'user does not exist',
                status_code: 400
            })
        }

        // validate Password
        bcrypt.compare(password, user.password)
            .then((isMatch) => {
                if (!isMatch) {
                    return res.status(400).json({
                        message: 'Invalid Credentials',
                        status_code: 400
                })
                }

                // jwt validation
                jwt.sign({ id: user.id }, config.get('jwtSecret'), { expiresIn: 315600000 }, (error, token) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({
                            message: "Login Failed !",
                            status_code: 500
                        })
                    };
                    return res.status(200).json({token: token,
                        user: {
                            id: user.id,
                            email: user.email,
                            "name": user.name,
                            register_date: user.register_date,
                        },
                        message: 'Login Successful',
                        status_code: 200
                    })
                    }
                )
            })
            // catch block for bcrpyt.compare()
            .catch((error) => {
                console.log(error)
                return res.status(500).json({
                    message: "Login Failed !",
                    status_code: 500
                })
            })  
    })
    // catch block for user.findOne()
    .catch((error) => {
        console.log(error)
        return res.status(500).json({
            message: "Login Failed !",
            status_code: 500
        })
    })
});



module.exports = router;  