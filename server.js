const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const db = require('./config/dbConnection');
const dotenv = require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const cors = require('cors');
const winston = require('winston');

db();

app.use(express.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload())

app.use('/api/leads' , require('./routes/leadsRoutes'));
app.use('/api/translate' , require('./routes/msTranslateRoutes'));
//app.use('/api/users' , require('./routes/userRoutes'));

/* For Error Log */
const logger = winston.createLogger({
    level: 'error', // Set the logging level
    format: winston.format.json(), // Use JSON format for logging
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }) // Save logs to a file
    ]
  });
app.use((err, req, res, next) => {
logger.error(err.stack); // Log the error stack trace
next(err);
});
/* For Error Log */

app.use(errorHandler)
port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


// Installed Plugin in VS Code
// Thunder Client for API Check
// Material Icon Theme by Philipp Kief
// Prettier - Code Formater
// GitHub Pull Requests
// MongoDB for VS Code
