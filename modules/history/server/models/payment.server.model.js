var mongoose = require('mongoose')
    Schema = mongoose.Schema;

var paymentSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    hotel: {
        type: Schema.ObjectId,
        ref: 'Hotel'
    },
    bottle: {
        type: Schema.ObjectId,
        ref: 'Bottle'
    },
    uniqueCode: {
        type: String,
        default: ''
    },
    cost: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'Pending'
    },
    quantity: {
        type: Number,
        default: 0
    },
    cancelledByAdmin: {
        type: Boolean, 
        default: false
    },
});
mongoose.model('Payment', paymentSchema);