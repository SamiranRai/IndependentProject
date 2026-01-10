const userRoutes = require('./routes/user.routes');

const registerGlobalRouteHandler = (app) => {
    app.use('/api/v1/users', userRoutes);
}

module.exports = registerGlobalRouteHandler;