const express = require("express");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log('"uncaughtException" Error, SHUTTING DOWN THE SYSTEM!');
  //shutting down the system!
  process.exit(1);
});

const { env } = require("./config/env");
const connectDB = require("./config/database");
const app = require("./app");

// DB URI
const URI = env.DATABASE.replace("<PASSWORD>", env.DATABASE_PASSWORD);
(async () => {
  await connectDB(URI);
})();

// SERVER STARTED
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is started at port ${PORT}..`);
});

process.on("unhandledRejection", (err) => {
  console.log({
    err,
  });
  console.log('unhandledRejection" Error, SHUTTING DOWN THE SYSTEM!');
  //shutting down the system!
  server.close(() => {
    process.exit(1);
  });
});
