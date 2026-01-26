const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const inboundRoutes = require("./routes/inbound.routes");

const registerGlobalRouteHandler = (app) => {
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/projects", projectRoutes);
  app.use("/api/v1/inbound", inboundRoutes);
};

module.exports = registerGlobalRouteHandler;
