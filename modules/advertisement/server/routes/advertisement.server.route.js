'use strict'


var advertisement = require('../controllers/advertisement.server.controller');


module.exports = function (app) {

    // Routes for create, listing  the advertisement
    app.route('/api/advertisements')
        .get(advertisement.getAdvertisementList)
        .post(advertisement.create);

    // return filtered advertisement according to the current date    
    app.route('/api/advertisementsByDate')
        .get(advertisement.getAdvertisementListByDate);   
        
    // to upload the images for advertisment    
    // app.route('/api/advertisement/upload')
    //     .post(advertisement.uploadAdvertisementImage)
    app.route('/api/credentials')
        .get(advertisement.getCredentials);    
    // Routes for delete and get the advertisement by id
    app.route('/api/advertisements/:advertisementId')
        .get(advertisement.read)
        .put(advertisement.updateAdvertisement)
        .delete(advertisement.deleteAdvertisement);
    
    //Find advertisement with id using the middleware
    app.param('advertisementId', advertisement.advertisementById);    
};