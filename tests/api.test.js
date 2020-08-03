const request = require("supertest");
const app = require("../app");
const redis = require("../redis");
const router = require("../routes");

app.use("/api/", router.apiroutes());

describe("Get outcome api", () => {
  it("should return a failure without a valid session", () => {
    return request(app)
      .get("/api/outcome")
      .then(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ success: false, error: "Invalid session" });
      });
  });
});

afterAll(() => redis.closeInstance());
