const express = require('express');
const { env } = require('./config/env');
const connectDB = require('./config/database');
const app = require('./app');

// DB URI
const URI = env.DATABASE.replace('<PASSWORD>', env.DATABASE_PASSWORD);
console.log(URI);
(async () => {
    await connectDB(URI);
})();


// SERVER STARTED
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is started at port ${PORT}..`);
});
