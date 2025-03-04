const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillReq: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['OPEN', 'CLOSED'], required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
    resumes: [{ type: Schema.Types.ObjectId, ref: 'ResumeAnalysed' }]
});

module.exports = mongoose.model('Job', jobSchema);
