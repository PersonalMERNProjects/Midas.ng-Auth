const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const AuthMiddleware = require('../../../middlewares/AuthMiddleware');


const User = require('../../../models/User')



//@route POST api/dashboard
//@desc Get a user 
//@access Private

router.get('/', AuthMiddleware, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then((user) => res.json(user))
})

module.exports = router;  
