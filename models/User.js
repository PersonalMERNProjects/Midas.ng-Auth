const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Craete a Schema 

UserSchema = new Schema({
    fullname: {
        type: String,
        required: [true, "can't be blank"],
        max: 255,
        min: 3,
        index: true
    },
    username: {
        type: String,
        required: [true, "can't be blank"],
        lowercase: true,
        index: true,
        max: 255,
        min:3
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
        max: 255,
        min:4
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6,
    },
    parent_name: {
        type: String,
        index: true,
        default: null
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'parent',
        default: null
    },
    created_At: {
        type: Date,
        default: Date.now
    },
    registered_by_parent: {
        type: Boolean,
        default: false,
        index: true
    },
    role: {
        type: String,
        enum: ["Client", "School", "Manager", "Admin", "Others"],
        default: "Client",
    }
    
},{ timestamps: true });

module.exports = User = mongoose.model('user', UserSchema);