# Mongrations

Simple migrations for Mongoose. 

* Migrations are remembered in a Mongo collection.


## Usage

Build commands into your Gulpfile:

```
var Mongoose = require('../models'),
    Mongrations = require('mongrations')({ mongoose: Mongoose });


Gulp.task('create_migration', function () {
    Mongrations.create(process.argv.slice(2));
});

Gulp.task('migrate', function () {
    Mongrations.up();
});

Gulp.task('rollback', function () {
    Mongrations.down();
});
```