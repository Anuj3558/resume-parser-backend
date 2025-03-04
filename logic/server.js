require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const { errorHandler } = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));
