'use strict';

module.exports = {
  app: {
    title: 'BVault',
    description: 'Application to purchase virtual drinks and redeem them at various restaurants',
    keywords: 'Drink, Purchase, Virtual Drink',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  sessionSecret: 'MEAN',
  sessionCollection: 'sessions',
  logo: 'modules/core/img/brand/logo.png',
  favicon: 'modules/core/img/brand/favicon.ico'
};
