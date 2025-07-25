const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    body:{
        type: String,
        required: true        
    },
    photo:{
        type: String,
        required: true
    },
    likes:[{
        type:ObjectId,
        ref:"USER"
    }],
    // comments:[{
    //     comment:{type:String},
    //     postedBy:{type:ObjectId, ref:"USER"}
    // }],
    comments: [
        {
        comment: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER",
        },
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true } // ensure each comment has its own ObjectId
        },
    ],
    postedBy:{
        type: ObjectId,
        ref: "USER"
    }

},{timestamps:true})

mongoose.model("POST", postSchema)