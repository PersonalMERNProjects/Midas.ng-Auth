const config = require('config');
const jwt = require('jsonwebtoken');



function AuthMiddleware(req, res, next) {
    const token = req.header('x-auth-token');


    // check for token 
    if (!token) {

        return res.status(401).json({
            message: "Access Denied!!!",
            status_code: 401
        })
    }

    try {

        // Verify token
        const decoded = jwt.verify(token, config.get('jwtSecret'))

        //Add user from Payload
        req.user = decoded;
        next();

    } catch (e) {

        res.status(400).json({
            message: "Token is not valid",
            status_code: 400
        })
    }
}

module.exports = AuthMiddleware; 