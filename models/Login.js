const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Craete a Schema 

LoginSchema = new Schema({
    parent_name: {
        type: String,
        index: true,
        default: null,
        max: 255,
        min: 3,
    },
    child_name: {
        type: String,
        index: true,
        default: null,
        max: 255,
        min: 3,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        max: 255,
        min: 4
    },
}, { timestamps: true });

module.exports = Login = mongoose.model('login', LoginSchema);