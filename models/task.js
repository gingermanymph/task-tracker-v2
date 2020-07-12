const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    assignTo: { type: mongoose.Types.ObjectId, ref: 'User' },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    createdAt: { type: Number }
});

module.exports = mongoose.model('Task', taskSchema);