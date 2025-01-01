const redis = require('redis');
var logger = require('../log');

function run(trigger, scope, data, config, callback) {
  let pConf = data.pluginconf.Redis;
  logger.main.debug('Redis Plugin Configuration: ' + JSON.stringify(pConf));
  if (pConf && pConf.enable) {
    logger.main.debug('Test Redis Configuration');

    if (data.pluginconf.Redis.host == "") {
      logger.main.error('Redis: ' + data.host + ' Redis does not have the required configurations defined');
      callback();
    } else {

      logger.main.debug('Redis: Sending to ' + data.pluginconf.Redis.host + ': ' + JSON.stringify("Test data"));
      let host = config.host;
      let port = config.port;
      let channel = config.channel;
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
