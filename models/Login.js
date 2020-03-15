const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Craete a Schema 

LoginSchema = new Schema({
    
    email: {
        type: String,
        ref: 'users',
        default: null,
        index: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        default: null,
        index: true
    },

    user_name: {
        type: String,
        ref: 'users',
        default: null,
        index: true
    }
    
}, { timestamps: true });

module.exports = Login = mongoose.model('login', LoginSchema);