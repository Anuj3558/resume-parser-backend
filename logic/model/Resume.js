const mongoose = require('mongoose');
const { Schema } = mongoose;

const resumeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    fileUrl: { type: String, required: true },
    parsedData: { type: Object, required: true },
    score: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
