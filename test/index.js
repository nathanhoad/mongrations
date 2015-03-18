var Should = require('should'),
    Async = require('async'),
    FS = require('fs'),
    Mongoose = require('mongoose');
    
Mongoose.connect('mongodb://localhost/mongrations_test');
var Migration = require('../migration')(Mongoose);


var Mongrations = require('..')({ mongoose: Mongoose, path: __dirname + '/migrations', log: false });


describe('Mongrations', function () {
    beforeEach(function (done) {
        Async.series({
            data: function (_done) {
                Migration.remove({}, _done);
            },
            
            files: function (_done) {
                FS.readdirSync(__dirname + '/migrations').sort().forEach(function (file) {
                    if (file != '1426677418737-print-a-log.js' && file != '1426680136800-do-nothing.js') {
                        FS.unlinkSync(__dirname + '/migrations/' + file);
                    }
                });
                _done();
            }
            
        }, done);
    });
    
    
    describe('init', function () {
        it('should return a new Mongrations instance', function (done) {
            Mongrations.options.path.should.equal(__dirname + '/migrations');
            done();
        });
    });
    
    
    describe('create', function () {
        it('should create a new migration', function (done) {
            Mongrations.create('new-migration');
            done();
        });
    });
    
    
    describe('up', function () {
        it('should run any pending migrations', function (done) {
            Async.series({
                count: function (_done) {
                    Migration.count({}, function (err, count) {
                        count.should.equal(0);
                        _done();
                    });
                },
                
                up: function (_done) {
                    Mongrations.up(_done);
                },
                
                newCount: function (_done) {
                    Migration.count({}, function (err, count) {
                        count.should.equal(2);
                        _done();
                    });
                }
                
            }, done);
        });
    });
    
    
    describe('down', function () {
        it('should undo the latest migration', function (done) {
            Async.series({
                count: function (_done) {
                    Migration.count({}, function (err, count) {
                        count.should.equal(0);
                        _done();
                    });
                },
                
                up: function (_done) {
                    Mongrations.up(_done);
                },
                
                newCount: function (_done) {
                    Migration.count({}, function (err, count) {
                        count.should.equal(2);
                        _done();
                    });
                },
                
                down: function (_done) {
                    Mongrations.down(_done);
                },
                
                finalCount: function (_done) {
                    Migration.count({}, function (err, count) {
                        count.should.equal(1);
                        _done();
                    });
                }
                
            }, done);
        });
    });
});