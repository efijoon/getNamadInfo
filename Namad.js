const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const namadSchema = Schema({
    namadID: { type: String, default: null },
    name: { type: String, default: null },
    data: { type: Object, default: null },
});

module.exports = mongoose.model('Namad' , namadSchema);