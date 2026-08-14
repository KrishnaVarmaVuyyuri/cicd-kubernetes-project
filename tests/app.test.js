const request = require("supertest");
const app = require("../src/app");

describe("Application API", () => {
  test("GET /health should return application health", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe("UP");
  });

  test("GET /api/users should return users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.statusCode).toBe(500);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("GET /api/users/1 should return user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.statusCode).toBe(500);
    expect(response.body.id).toBe(1);
  });

  test("GET /api/users/999 should return 404", async () => {
    const response = await request(app).get("/api/users/999");

    expect(response.statusCode).toBe(404);
  });
});
