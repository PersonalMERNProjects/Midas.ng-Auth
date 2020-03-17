const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const joi = require('@hapi/joi')

//User Model
const User = require('../../../models/User');
// const Parent = require('../../../models/Parent');

// validation Schema using @hapi/joi lib
const RegistrationSchemaValidation = joi.object(
    {
        fullname: joi.string().min(3).required().max(255),
        email: joi.string().min(6).max(255).required().email(),
        password: joi.string().min(6).max(1024).required(),
        username: joi.string().required().max(255).min(3),
    }
)


//@route POST v1/auth/adult
//@desc Register new adult Users (over 16)
//@access Public

router.post('/', async (req, res) => {
    const { fullname, email, password, username } = req.body;

    // simple Validation to check if field are filled before registration
    if (!email || !fullname || !password || !username) {
        return res.status(400).json({
            message: "Please enter all fields",
            status_code: 400
        })
    }

    // To enable a more graceful crash and catch error
    try {
        const { error } = RegistrationSchemaValidation.validate(req.body);

        //check for validation error
        if (error) {
            console.log(error)
            // remove backslash and double quote returned from @hapi/lib error
            const errorMessage = error.details[0].message.replace(/"/gi, "")
            return res.status(400).json({
                message: errorMessage,
                status_code: 400
            })
        }
        //  if there are no validation error, check if a user exist with the same email
        User.findOne({ email: email })
            .then((user) => {
                if (user) {
                    return res.status(400).json({
                        message: 'user already exist',
                        status_code: 400
                    })
                }

                //  create a new user class to be saved in the DatatBase
                const newUser = new User({
                    fullname: fullname,
                    username: username,
                    email: email,
                    password: password,
                });

                //  create a new parent class to be saved in the DatatBase
                // const newParent = new Parent ({
                //     child_name: fullname,
                //     email: email,
                // })

                // Create salt & hash for password
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({
                                message: "Authentication Failed!",
                                status_code: 500
                            })
                        }
                        newUser.password = hash;

                        //Save user to database and return json 
                        newUser.save()
                            .then((user) => {
                                //  create and sign a jwt token to last a year.   //one year token duration
                                jwt.sign({ id: user.id }, config.get('jwtSecret'), { expiresIn: 315600000 }, (error, token) => {
                                    if (error) {
                                        return res.status(500).json({
                                            message: "Authentication failed",
                                            status_code: 500
                                        });
                                    };
                                    // newParent.save()
                                    return res.status(200).json({
                                        token: token,
                                        user: {
                                            id: user.id,
                                            name: user.name,
                                            email: user.email,
                                            created_At: user.created_At,
                                            token: "Bearer " + token
                                        },
                                        message: 'Registration Successful',
                                        status_code: 200
                                    })
                                }
                                )
                            })
                            // catch block for newuser.save() 
                            .catch((error) => {
                                console.log(error)
                                return res.status(500).json({
                                    message: "Authentication Failed!",
                                    status_code: 500
                                })
                            })
                    })
                })
            })
            // catch block for user.findOne()
            .catch((error) => {
                console.log(error)
                return res.status(500).json({
                    message: "Authentication Failed!",
                    status_code: 500
                })
            })

    }
    // catch block for the try block
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Validation Failed",
            status_code: 500
        })
    }
})

module.exports = router;  