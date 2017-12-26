'use strict';


// Dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var activitySchema = new Schema({

    created: {
        type: Date,
        default: Date.now
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        default: ''
    },
    object: {
        type: Schema.ObjectId,
        refPath: 'refTable'
    },
    refTable: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default:Date.now.toLocaleDateString
    },
});
mongoose.model('Activity', activitySchema);