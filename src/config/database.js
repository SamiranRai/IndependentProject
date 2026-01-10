const mongoose = require('mongoose');

const connectDB = async (URI) => {
    try {
        await mongoose.connect(URI);
        console.log(`APP SUCCESSFULLY CONNECTED TO DB..`);
    } catch (err) {
        console.error(`DATABASE CONNECTION ERROR: `, {
            err
        });

        // SHUT DOWN THE SERVER
        process.exit(1);
    }
}

module.exports = connectDB;