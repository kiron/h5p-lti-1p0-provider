var axios = require("axios");
var crc = require("crc");
var merge = require("merge");
var qs = require("qs");

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };

class ContentTypeCache {
  constructor(config, storage) {
    console.log("initialize");
    this.config = config;
    this.storage = storage;
  }

  convertCacheEntryToLocalFormat = function (entry) {
    return {
      categories: entry.categories || [],
      createdAt: Date.parse(entry.createdAt),
      description: entry.description,
      example: entry.example,
      h5pMajorVersion: entry.coreApiVersionNeeded.major,
      h5pMinorVersion: entry.coreApiVersionNeeded.minor,
      icon: entry.icon,
      isRecommended: entry.isRecommended,
      keywords: entry.keywords || [],
      license: entry.license,
      machineName: entry.id,
      majorVersion: entry.version.major,
      minorVersion: entry.version.minor,
      owner: entry.owner,
      patchVersion: entry.version.patch,
      popularity: entry.popularity,
      screenshots: entry.screenshots,
      summary: entry.summary,
      title: entry.title,
      tutorial: entry.tutorial || "",
      updatedAt: Date.parse(entry.updatedAt)
    };
  };
  generateLocalId = function () {
    console.log("generating local Id");
    return crc.crc32(__dirname);
  };

  downloadContentTypesFromHub = function () {
    return __awaiter(this, void 0, void 0, function () {
      var formData, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log(
              "downloading content types from hub " +
                this.config.hubContentTypesEndpoint
            );
            return [4 /*yield*/, this.registerOrGetUuid()];
          case 1:
            _a.sent();
            formData = this.compileRegistrationData();
            if (this.config.sendUsageStatistics) {
              formData = merge.recursive(
                true,
                formData,
                this.compileUsageStatistics()
              );
            }
            return [
              4 /*yield*/,
              axios["default"].post(
                this.config.hubContentTypesEndpoint,
                qs.stringify(formData)
              )
            ];
          case 2:
            response = _a.sent();
            if (response.status !== 200) {
              throw new error["default"](
                "error-communicating-with-hub",
                {
                  statusCode: response.status.toString(),
                  statusText: response.statusText
                },
                504
              );
            }
            if (!response.data) {
              throw new error["default"](
                "error-communicating-with-hub-no-status",
                {},
                504
              );
            }
            return [2 /*return*/, response.data.contentTypes];
        }
      });
    });
  };

  forceUpdate = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cacheInHubFormat, error_1, cacheInInternalFormat;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("forcing update");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.downloadContentTypesFromHub()];
          case 2:
            cacheInHubFormat = _a.sent();
            if (!cacheInHubFormat) {
              return [2 /*return*/, undefined];
            }
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error(error_1);
            return [2 /*return*/, undefined];
          case 4:
            cacheInInternalFormat = cacheInHubFormat.map(
              this.convertCacheEntryToLocalFormat
            );
            return [
              4 /*yield*/,
              this.storage.save("contentTypeCache", cacheInInternalFormat)
            ];
          case 5:
            _a.sent();
            return [
              4 /*yield*/,
              this.storage.save("contentTypeCacheUpdate", Date.now())
            ];
          case 6:
            _a.sent();
            return [2 /*return*/, cacheInInternalFormat];
        }
      });
    });
  };

  get = function () {
    var machineNames = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      machineNames[_i] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
      var cache;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("getting content types");
            return [4 /*yield*/, this.storage.load("contentTypeCache")];
          case 1:
            cache = _a.sent();
            if (!!cache) return [3 /*break*/, 3];
            console.log(
              "ContentTypeCache was never updated before. Downloading it from the H5P Hub..."
            );
            return [4 /*yield*/, this.forceUpdate()];
          case 2:
            // try updating cache if it is empty for some reason
            cache = _a.sent();
            // if the cache is still empty (e.g. because no connection to the H5P Hub can be established, return an empty array)
            if (!cache) {
              console.log("ContentTypeCache could not be retrieved from H5P Hub.");
              return [2 /*return*/, []];
            }
            _a.label = 3;
          case 3:
            if (!machineNames || machineNames.length === 0) {
              return [2 /*return*/, cache];
            }
            return [
              2 /*return*/,
              cache.filter(function (contentType) {
                return machineNames.some(function (machineName) {
                  return machineName === contentType.machineName;
                });
              })
            ];
        }
      });
    });
  };

  isOutdated = function () {
    return __awaiter(this, void 0, void 0, function () {
      var lastUpdate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("checking if content type cache is up to date");
            return [4 /*yield*/, this.storage.load("contentTypeCacheUpdate")];
          case 1:
            lastUpdate = _a.sent();
            return [
              2 /*return*/,
              !lastUpdate ||
                Date.now() - lastUpdate >
                  this.config.contentTypeCacheRefreshInterval
            ];
        }
      });
    });
  };

  registerOrGetUuid = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log(
              "registering or getting uuid from hub " +
                this.config.hubRegistrationEndpoint
            );
            if (this.config.uuid && this.config.uuid !== "") {
              return [2 /*return*/, this.config.uuid];
            }
            return [
              4 /*yield*/,
              axios["default"].post(
                this.config.hubRegistrationEndpoint,
                this.compileRegistrationData()
              )
            ];
          case 1:
            response = _a.sent();
            if (response.status !== 200) {
              throw new error["default"](
                "error-registering-at-hub",
                {
                  statusCode: response.status.toString(),
                  statusText: response.statusText
                },
                500
              );
            }
            if (!response.data || !response.data.uuid) {
              throw new error["default"](
                "error-registering-at-hub-no-status",
                {},
                500
              );
            }
            console.log("setting uuid to " + response.data.uuid);
            this.config.uuid = response.data.uuid;
            return [4 /*yield*/, this.config.save()];
          case 2:
            _a.sent();
            return [2 /*return*/, this.config.uuid];
        }
      });
    });
  };

  updateIfNecessary = function () {
    return __awaiter(this, void 0, void 0, function () {
      var oldCache, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            console.log("checking if update is necessary");
            return [4 /*yield*/, this.storage.load("contentTypeCache")];
          case 1:
            oldCache = _b.sent();
            _a = !oldCache;
            if (_a) return [3 /*break*/, 3];
            return [4 /*yield*/, this.isOutdated()];
          case 2:
            _a = _b.sent();
            _b.label = 3;
          case 3:
            if (!_a) return [3 /*break*/, 5];
            console.log("update is necessary");
            return [4 /*yield*/, this.forceUpdate()];
          case 4:
            return [2 /*return*/, _b.sent() !== undefined];
          case 5:
            console.log("no update necessary");
            return [2 /*return*/, false];
        }
      });
    });
  };

  compileRegistrationData = function () {
    console.log(
      "compiling registration data for hub " +
        this.config.hubRegistrationEndpoint
    );
    return {
      core_api_version:
        this.config.coreApiVersion.major +
        "." +
        this.config.coreApiVersion.minor,
      disabled: this.config.fetchingDisabled,
      h5p_version: this.config.h5pVersion,
      local_id: this.generateLocalId(),
      platform_name: this.config.platformName,
      platform_version: this.config.platformVersion,
      type: this.config.siteType,
      uuid: this.config.uuid
    };
  };

  compileUsageStatistics = function () {
    console.log("compiling usage statistics");
    return {
      libraries: {},
      num_authors: 0 // number of active authors
    };
  };
}

module.exports = { ContentTypeCache };
