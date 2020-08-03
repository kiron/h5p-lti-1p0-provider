const fs = require("fs");
const utils = require("util");

const getStat = utils.promisify(fs.stat.bind(fs));

exports.readFile = async (file, options = null) => {
  try {
    const { size } = await getStat(file);
    const config =
      options !== null
        ? {
            start: options.start,
            end: options.end || size - 1
          }
        : {};

    const stream = fs.createReadStream(file, config);

    return {
      stream,
      range: {
        start: config.start,
        end: config.end || size - 1, // IMPORTANT: Subtract 1 to enable streaming-loading
        size
      },
      contentSize: config.end - config.start + 1 // IMPORTANT: Increment by 1 -> Prevent infinite streaming
    };
  } catch (e) {
    return null;
  }
};
