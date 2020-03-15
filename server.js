const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const cors = require('cors');
const config = require('config')
const passport = require('passport')

const app = express();

//Body MiddleWare 

app.use(express.json());
app.use(passport.initialize())
app.use(cors());

require('./middlewares/PassportMiddleware')(passport);

//DB config
const DbConfig = config.get('mongoURI')


//connect DB config
mongoose.connect(DbConfig, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log('mongoDB connected')
    })
    .catch(err => {
        console.log("operation failed", err)
    })


//use route   
app.use('/v1/auth/adult', require('./routes/api/Public/AdultRegistration'));
app.use('/v1/auth/kid', require('./routes/api/Public/KidsRegistration'));
app.use('/v1/auth/login', require('./routes/api/Public/LoginAuthentication'));
app.use('/dashboard', require('./routes/api/Private/TestDashboard'));
app.use((req, res, next) => {
    const error = new Error("Not Found")
    res.status(404).json({
        message: "Bad Request",
        status_code: 404
    })
    next(error)
})

//serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    //Set static folder
    app.use(express.static('client/build'));


    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}


//port 
const port = process.env.PORT || 5000;


// server starting port 
app.listen(port, () => console.log(`server started on port ${port}`));


