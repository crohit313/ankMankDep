// Dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;




var productManagementSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    hotel: {
        type: Schema.ObjectId,
        ref: 'Hotel',
        required: 'Hotel is required'
    },
    products: {
        type: Array,
        default: []
    }
});
mongoose.model('ProductManagement', productManagementSchema);
