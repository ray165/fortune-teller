require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {logUsage, logUserUsage} = require('./utils/logger');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const apiRouter = require('./routes/api');

const app = express();
const port = 3000;

const corsOptions = {
    origin: "https://fortune-teller-fe.onrender.com",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logUsage);
app.use(logUserUsage);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/stats', statsRouter);
app.use('/api', apiRouter);

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB connection is established successfully! 🎉')
	})

	
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
