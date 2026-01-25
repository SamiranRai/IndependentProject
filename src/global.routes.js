const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const inboundEmailRoutes = require("./routes/inboundEmail.routes");

const registerGlobalRouteHandler = (app) => {
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/projects", projectRoutes);
  app.use("/api/v1/inbound", inboundEmailRoutes);
};

module.exports = registerGlobalRouteHandler;
