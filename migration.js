module.exports = function (Mongoose) {
    
    try {
        return Mongoose.model('Mongration');
        
    } catch (err) {
        var MigrationSchema = Mongoose.Schema({
            file: { type: String, index: true, trim: true },
            createdAt: { type: Date, index: true },
        });

        MigrationSchema.pre('save', function (done) {
            if (this.createdAt == undefined) {
                this.createdAt = new Date();
            }
            done();
        });

        return Mongoose.model('Mongration', MigrationSchema);
    }
    
};