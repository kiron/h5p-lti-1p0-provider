const { RANGE_TYPE, DEFAULT_RANGE } = require("./constants");

exports.getRange = range => {
  if (!range) return null;
  const match = String(range).match(RANGE_TYPE + "\\=(\\d+)\\-(\\d+)?");
  if (!match) return null;
  if (match.length < 2) return DEFAULT_RANGE;

  return { start: Number(match[1]), end: match[2] ? Number(match[2]) : null };
};

exports.formatRange = options => {
  const { start, end, size } = options || {};
  if (
    typeof start !== "number" ||
    typeof end !== "number" ||
    typeof size !== "number" ||
    start < 0 ||
    end <= 0 ||
    size <= 0
  )
    return null;

  return `${RANGE_TYPE} ${start}-${end}/${size}`;
};
