module.exports = {
    
    up: function (done) {
        console.log('\tPrinting from migration.up()');
        done();
    },
   
    down: function (done) {
        console.log('\tPrinting from migration.down()');
        done();
    }
   
};