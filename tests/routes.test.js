const request = require("supertest");
const app = require("../app");
const router = require("../routes");
const redis = require("../redis");
app.use("/", router.routes());

describe("Get Status", () => {
  it("should return the up status", () => {
    return request(app)
      .get("/")
      .then(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
          status: "Up"
        });
      });
  });
});

describe("Get Application", () => {
  it("should stop us accessing without proper auth", () => {
    return request(app)
      .get("/application")
      .then(res => {
        expect(res.statusCode).toEqual(403);
        expect(res.text).toEqual(
          "Session invalid. Please login via LTI to use this application."
        );
      });
  });
});

afterAll(() => redis.closeInstance());
