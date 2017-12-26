//file upload service used for communicating with the files REST endpoints
angular.module('core').service('uploadService', ['Upload','$rootScope', '$q', '$timeout', 'Restangular',
    function (Upload, $rootScope, $q, $timeout, Restangular) {
        var _this = this;
        _this.config = {};

        
        _this.uploadFileToAws = function (file, folderName) {
            return $q(function(resolve, reject) {
                   
                // console.log('file in the service', file);
                var s3 = new AWS.S3({ params: { Bucket: _this.config.bucketName, maxRetries: 10 }, httpOptions: { timeout: 360000 } });
                var fileName = Date.now()+'.'+file.type.split('/')[1],
                    fileType = file.type;

                var s3Params = {
                        Bucket: _this.config.bucketName,
                        Key: folderName+'/'+fileName,
                        Body:file,
                        Expires: 60,
                        ContentType: fileType,
                        ACL: 'public-read',
                    };
                s3.putObject(s3Params, function(err, data) {
                    if(err) {
                        reject(err);
                    }
                    else { 
                        resolve(fileName);    
                    }
                }).on('httpUploadProgress', function (evt) {
                });      
            });
        };
        _this.deleteFileFromAws = function (folderName, fileName) {
            return $q(function(resolve, reject) {
                if(fileName !==undefined || fileName !==null) {
                    AWS.config = new AWS.Config();
                    AWS.config.region = _this.config.region;
                    AWS.config.update({ accessKeyId: _this.config.accessKeyId, secretAccessKey: _this.config.secretAccessKey });
                    var s3 = new AWS.S3();
                    s3.deleteObject({Bucket: _this.config.bucketName ,Key:folderName+'/'+fileName}, function(err, success) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(success);
                        }
                    });
                }                
            });
        };
    
        _this.singleFileUpload = function (url, file, user) {

            return Upload.upload({
                    url: url,
                    data: {file: file, user: user},
                });
        };

        _this.getBase64DataUrl = function (file) {
            return Upload.base64DataUrl(file);
        };

        _this.getCredentials = function() {
            return Restangular.one('api/credentials').get();
        };
        _this.getAwsUrl = function () {
            return 'https://s3-'+_this.config.region+'.amazonaws.com/'+_this.config.bucketName+'/';
        };
        _this.setCredentials = function () {
            AWS.config = new AWS.Config();
            AWS.config.region = _this.config.region;
            AWS.config.update({ accessKeyId: _this.config.accessKeyId, secretAccessKey: _this.config.secretAccessKey });
        };

        $rootScope.$watch(function(){return _this.config;}, function(newValue, oldValue){
            if(newValue.bucketName && !oldValue.bucketName) {
                
                _this.setCredentials();
            }            
        });
    }
]);
  