const subscribe = artifacts.require("NetflixSubscription");

module.exports = function(deployer) {
  deployer.deploy(subscribe);
};

