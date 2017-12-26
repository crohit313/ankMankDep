'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  
  db: {
    //Local database
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/xarba',
    options: {
      user: '',
      pass: ''
    },

    // Mlab database
    // uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://ds155473.mlab.com:55473/ixarba',
    // options: {
    //   user: 'iXarba',
    //   pass: 'iXarba@123'
    // },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },

  // Ramanuj sir aws account
  // aws: {
  //   region: process.env.region || 'us-east-1',
  //   bucketName: process.env.bucketName || 'sample-bucket-xarba',
  //   accessKeyId: process.env.accessKeyId || 'AKIAJAIY65ASB4I2SESA', 
  //   secretAccessKey: process.env.secretAccessKey || '4IFbdrf4RYUBGeXyRM2iaEGScFMIbtEiXa6B1ral',
  // },
  aws: {
    region: process.env.region || 'ap-south-1',
    bucketName: process.env.bucketName || 'bvault',
    accessKeyId: process.env.accessKeyId || 'AKIAI2L36AH774C2LQPQ', 
    secretAccessKey: process.env.secretAccessKey || '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'
  },

  oneSignal: {
    oneSignalAppId: process.env.oneSignalAppId || '6741071e-f8e5-4242-a974-0cc189849333',
    oneSignalApiKey: process.env.oneSignalApiKey || 'MTM0ZDM0NmEtOWQ1OS00NmU2LTg5MjAtYTFjYmI4OTI3MjFl'
  },

  mailer: {
    from: process.env.MAILER_FROM || 'no-reply@bvault.in',
    options: {
        service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
        auth: {
            user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
            pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
        }           
    },
    postmarkServerToken: '375b0737-3ddb-4eb0-9181-4512cb3231df'
  },

  payUMoney: {
    merchantKey: process.env.merchantKey || 'vz1MRk',
    salt: process.env.salt || 'ubMUQ7tJ'
  },
  // mailer: {
  //   from: process.env.MAILER_FROM || 'business@bvault.in',
  //   options: {
  //       service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
  //       auth: {
  //           user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
  //           pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
  //       }           
  //   },
  //   postmarkServerToken: '375b0737-3ddb-4eb0-9181-4512cb3231df'
  // },
  livereload: true
};
