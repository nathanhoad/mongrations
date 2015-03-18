var Async = require('async'),
    FS = require('fs'),
    _ = require('lodash'),
    Migration;


var Mongrations = function (options) {
    var defaultOptions = {
        path: './migrations',
        mongoose: null,
        log: true
    };
    
    this.options = _.assign(defaultOptions, options);
    Migration = require('./migration')(options.mongoose);
};


Mongrations.prototype.create = function (name) {
    var template = [
        'module.exports = {',
        '    up: function (done) {',
        '        done();',
        '    },',
        '    ',
        '    down: function (done) {',
        '        done();',
        '    }',
        '}'
    ].join('\n');
    
    var filename = this.options.path + '/' + Date.now() + '-' + name + '.js';
    
    FS.writeFileSync(filename, template);
    this._log('CREATE: ' + filename);
    
    return filename;
};

    
// Run any migrations that haven't already been run
Mongrations.prototype.up = function (callback) {
    var M = this,
        path = M.options.path,
        migration;
    
    var migrationFileFilter = function (file) { return FS.statSync(path + '/' + file).isFile() && file.match(/^[^\_].*\.js$/); };
    
    M._migrations(function (migrations) {
        var files = FS.readdirSync(path).filter(migrationFileFilter).sort();
        Async.eachSeries(files, function (file, done) {
            if (migrations.indexOf(file) === -1 ) {
                migration = require(path + '/' + file);
                migration.up(function () {
                    M._afterUp(file, done);
                });
            }
        }, callback);
    });
};
    
    
// Find the last run migration and and perform its 'down' action
Mongrations.prototype.down = function (callback) {
    var M = this,
        path = M.options.path,
        file;
    
    M._migrations(function (migrations) {
        file = migrations[migrations.length - 1];
        
        migration = require(path + '/' + file);
        migration.down(function () {
            M._afterDown(file, callback);
        });
    });
};
    
    
// Array of filenames that have been processed already (in order of processing)
Mongrations.prototype._migrations = function (callback) {
    return Migration.find({}).sort('-createdAt').exec(function (err, migrations) {
        migrations = migrations.map(function (migration) { return migration.file; });
        callback(migrations);
    });
};


// Run after each successful 'up'
Mongrations.prototype._afterUp = function (file, callback) {
    var M = this;
    
    new Migration({ file: file }).save(function () {
        M._log('UP: ' + file);
        callback();
    });
};


// Run after each successful 'down'
Mongrations.prototype._afterDown = function (file, callback) {
    var M = this;
    
    Migration.remove({ file: file }, function () {
        M._log('DOWN: ' + file);
        callback();
    });
};


Mongrations.prototype._log = function (message) {
    if (this.options.log === true) {
        console.log(message);
    }
};



module.exports = function (options) {
    return new Mongrations(options);
};