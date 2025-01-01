const redis = require('redis');
var logger = require('../log');

function run(trigger, scope, data, config, callback) {
  let pConf = data.pluginconf.Redis;
  logger.main.debug('Redis Plugin Configuration by Alias: ' + JSON.stringify(pConf));
  if (pConf && pConf.enable) {
    logger.main.debug('Redis plugin is enabled');

    if (data.pluginconf.Redis.channel == ""){
      logger.main.error('Redis: ' + 'Alias plugin does not have the required configurations defined.. defaulting to main');
      callback();
    }
    else if (data.pluginconf.Redis.channel == "") {
      logger.main.error('Redis: ' + 'Main plugin definition does not have the required configurations defined... exiting');
      callback();
    } 
    else {

      logger.main.debug('Redis: Sending to ' + data.pluginconf.Redis.host);
      let host = config.host;
      let port = config.port;
      let channel = data.pluginconf.Redis.channel || config.channel;
      let username = config.username;
      let password = config.password;

      const publisher = redis.createClient({
          socket: {
            host: host,
            port: port
          },
          username: username,
          password: password
        }
      );
      publisher.on('error', err => logger.main.error('Redis Client Error', err));

      (async () => {
        await publisher.connect();

        const message = {
          title: `"${data.agency} - ${data.alias}"`,
          message: `${data.message}`,
        };
        logger.main.debug('Redis: Sending data: ' + JSON.stringify(message));

        await publisher.publish(channel, JSON.stringify(message));
      })();

      callback();
    }
  }
  else {
    callback();
  }
}

module.exports = {
  run: run
}
