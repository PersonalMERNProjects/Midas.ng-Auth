const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')


//User Model
const User = require('../../../models/User')
const Login = require('../../../models/Login')

//@route POST api/auth
//@desc Authenticate/login user
//@access Public

const LoginSchemaValidation = joi.object(
    {
        email: joi.string().min(6).max(255).required().email(),
        password: joi.string().min(6).max(1024).required(),
    }
)

router.post('/', (req, res) => {
    const { email, password } = req.body;

    //simple validation to ensure all fields are filled
    if (!email || !password) {
        return res.status(400).json({
            message: 'please enter all fields',
            status_code: 400
        })
    }


    try {

        const { error } = LoginSchemaValidation.validate(req.body);

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

        // { $or: [{ 'email': credential }, { 'username': credential }] } query for login that supports bth username and email as login credential
        // checking for existing user
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    console.log(user)
                    return res.status(400).json({
                        message: 'user does not exist',
                        status_code: 400
                    })

                }
                User.findOneAndUpdate({ email: email }, { $set: { 'last_login_date': Date.now() }, upsert: true, })
                    .then((user) => {
                        const newLogin = new Login({
                            email: user.email,
                            user_id: user._id,
                            username: user.username
                        })
                        newLogin.save()
                    })


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
                        jwt.sign({ id: user.id, email: user.email, username: user.username }, config.get('jwtSecret'), { expiresIn: 315600000 }, (error, token) => {
                            if (error) {
                                console.log(error);
                                return res.status(500).json({
                                    message: "Login Failed !",
                                    status_code: 500
                                })
                            };
                            const decode = jwt.verify(token, config.get('jwtSecret'))
                            return res.status(200).json({
                                token: token,
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    "name": user.username,
                                    register_date: user.register_date,
                                    decode: decode,
                                    token: "Bearer " + token
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
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Login Failed",
            status_code: 500
        })
    }
});



module.exports = router;  