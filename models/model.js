const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    photo: {
     type: String,
     
    },
    followers: [{ type: ObjectId, ref: "USER" }],
    following: [{ type: ObjectId, ref: "USER" }]
})

mongoose.model("USER", userSchema)
