const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
let currentClient = null;

exports.getRedisSessionStore = () => {
  if (!currentClient) {
    currentClient = redis.createClient(process.env.REDIS_URL);
  }
  return new RedisStore({ client: currentClient });
};

exports.getRedisNonceStore = RedisNonceStore => {
  if (!currentClient) {
    currentClient = redis.createClient(process.env.REDIS_URL);
  }
  return new RedisNonceStore("consumer_key", currentClient);
};

exports.closeInstance = callback => {
  if (currentClient) {
    currentClient.quit(callback);
  }
};
