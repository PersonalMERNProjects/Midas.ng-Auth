const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const joi = require('@hapi/joi') 

//User Model
const User = require('../../../models/User')
const Parent = require('../../../models/Parent')

// validation Schema using @hapi/joi lib
const RegistrationSchemaValidation = joi.object(
    {
        fullname: joi.string().min(3).required().max(255),
        email: joi.string().min(6).max(255).required().email(),
        password: joi.string().min(6).max(1024).required(),
        username: joi.string().required().max(255).min(3),
        parent_name: joi.string().max(255).min(3),
    }
)


//@route POST v1/auth/kids
//@desc Register new kid User by parent (under 16)
//@access Public

router.post('/', async (req, res) => {
    const { fullname, email, password, username, parent_name } = req.body; 
    
    // simple Validation to check if field are filled before registration

    if (!email || !fullname || !password || !username || !parent_name) {
        return res.status(400).json({
            message: "Please enter all fields",
            status_code: 400
        })
    }

    // To enable a graceful server crash...
    try {

        // Apply joi validation
        const { error } = RegistrationSchemaValidation.validate(req.body);
        
        //check for validation error
        if (error) {
            // remove double quote and backslash that comes from joi error message
            const errorMessage = error.details[0].message.replace(/"/gi, "")
            // send a bad request status if any of the validation rule fails
            console.log(error)
            return res.status(400).json({
                message: errorMessage,
                status_code: 400
            })
        }

        //  if there are no validation error, check if a user exist with the same email
        User.findOne({ email: email })
        .then((user) => {
            if (user) {
                // if there exist a user, send a 400 bad request error with a message of "user already exist"
                return res.status(400).json({
                    message: 'user already exist',
                    status_code: 400
                })
            }

            // instanciating a new parent class to be saved in the database
            const newParent = new Parent({ parent_name: parent_name, email: email, child_name: fullname })

            newParent.save()
                .then((parent) => {
                     parentId = parent._id
                    

                    const newUser = new User({
                        fullname: fullname,
                        username: username,
                        email: email,
                        password: password,
                        parent_name: parent_name,
                        parent_id: parentId,
                        registered_by_parent: true
                    });

                    // Create salt & hash for password...as password cannot saved plainly
                    bcrypt.genSalt(10, (error, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if (error) {
                                console.log(error)
                                return res.status(500).json({
                                    message: "authentication Failed!",
                                    status_code: 500
                                })
                            }
                            newUser.password = hash;

                            //Save user to database and return json 
                            newUser.save()
                                .then((user) => {
                                    //  create and sign a jwt token to last a year.
                                    jwt.sign({ id: user.id }, config.get('jwtSecret'), { expiresIn: 315600000 }, (error, token) => {
                                        if (error) {
                                            console.log(error)
                                            return res.status(500).json({
                                                message: "Authentication failed",
                                                status_code: 500
                                            });
                                        };
                                        return res.status(200).json({
                                            token: token,
                                            user: {
                                                id: user.id,
                                                name: user.name,
                                                email: user.email,
                                                register_date: user.register_date,
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
            // catch block for newParent.save()... If save fails for any reason, send a internal server error message
                .catch((error) => {
                    console.log(error)
                    return res.status(500).json({
                        message: "Authentication Failed!",
                        status_code: 500
                })
            })
        })
        // catch block for User.findOne()
            .catch((error) => {
                console.log(error)
            return res.status(500).json({
                message: "Authentication Failed!",
                status_code: 500
            })
        })    
    }
    //catch block for the try block
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Authentication Failed",
            status_code: 500
        })
    }
})


module.exports = router;  