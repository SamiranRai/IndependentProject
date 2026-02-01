const deriveProjectSetupState = (setup) => {
    if (!setup.inputProvider) {
        return "CREATED";
      }
    
      if (!setup.providerConfigured) {
        return "INPUT_SELECTED";
      }
    
      if (!setup.destinationConfigured) {
        return "INPUT_CONFIGURED";
      }
    
      if (!setup.completedAt) {
        return "DESTINATION_CONFIGURED";
      }
    
      return "COMPLETED";
};

module.exports = { deriveProjectSetupState };
