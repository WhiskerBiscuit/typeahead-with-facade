module.exports = {
    handle: function(app) {
        this.configureCommon(app);
    },

    configureCommon: function() {},
    configureDevelopmentEnv: function() {},
    configureProductionEnv: function() {}
};
