var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');
var Asset = mongoose.model('Asset');
var Log = mongoose.model('Log');
var Tag = mongoose.model('Tag');
var Backfill = mongoose.model('Backfill');
var util = require('./util.js');
var async = require("async");

module.exports = {
    
    send: null,

    routes: function(app) {


    }
}

