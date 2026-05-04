import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { clearDatabase } from "./clearDB.js";
import { ENV } from "../../lib/env.js"
import { connectDB } from "./db_test.js"
import dns from "node:dns/promises";

beforeAll(async () => {

  dns.setServers(["1.1.1.1"]);
  await connectDB()
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Auth Integration", () => {

  let agent = request.agent(app); // IMPORTANT (keeps cookies)

  it("should signup and login user", async () => {

    // 1️⃣ Get CSRF token
    const csrfRes = await agent.get("/api/auth/csrf-token");

    const csrfToken = csrfRes.body.csrfToken;

    // 2️⃣ Signup
    await agent
      .post("/api/auth/signup")
      .set("x-csrf-token", csrfToken)
      .send({
        name: "Test",
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(201);

    // 3️⃣ Get new CSRF token (important)
    const csrfRes2 = await agent.get("/api/auth/csrf-token");
    const csrfToken2 = csrfRes2.body.csrfToken;

    // 4️⃣ Login
    const loginRes = await agent
      .post("/api/auth/login")
      .set("x-csrf-token", csrfToken2)
      .send({
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(200);

    // 5️⃣ Assertions
    // Verify cookies are set
    expect(loginRes.headers["set-cookie"]).toBeDefined();

    // Optional: stronger assertion
    const cookies = loginRes.headers["set-cookie"];

    expect(cookies.some(c => c.includes("accessToken"))).toBe(true);
    expect(cookies.some(c => c.includes("refreshToken"))).toBe(true);
  });
  it("should give new refresh token", async () => {
    const csrfRes3 = await agent.get("/api/auth/csrf-token");
    const csrfToken3 = csrfRes3.body.csrfToken;

    //Signup
    await agent
      .post("/api/auth/signup")
      .set("x-csrf-token", csrfToken3)
      .send({
        name: "Test",
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(201);

    const csrfRes4 = await agent.get("/api/auth/csrf-token");
    const csrfToken4 = csrfRes4.body.csrfToken;

    //Login

    const loginRes = await agent
      .post("/api/auth/login")
      .set("x-csrf-token", csrfToken4)
      .send({
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(200);


    const csrfRes5 = await agent.get("/api/auth/csrf-token");
    const csrfToken5 = csrfRes5.body.csrfToken;

    //Call refresh-token
    const res = await agent
      .post("/api/auth/refresh-token")
      .set("x-csrf-token", csrfToken5)
      .expect(200);

    // Check response body
    expect(res.body.message).toBe("Token refreshed successfully");

    // Check cookies
    expect(res.headers["set-cookie"]).toBeDefined();

    const cookies = res.headers["set-cookie"];

    expect(cookies.some(c => c.includes("accessToken"))).toBe(true);
    expect(cookies.some(c => c.includes("refreshToken"))).toBe(true);

  });

});

describe("GET /profile", () => {

  let agent = request.agent(app);

  it("should return user profile when authenticated", async () => {

    // 1️⃣ Get CSRF
    const csrfRes = await agent.get("/api/auth/csrf-token");
    const csrfToken = csrfRes.body.csrfToken;

    // 2️⃣ Signup
    await agent
      .post("/api/auth/signup")
      .set("x-csrf-token", csrfToken)
      .send({
        name: "Test",
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(201);

    // 3️⃣ Get new CSRF
    const csrfRes2 = await agent.get("/api/auth/csrf-token");
    const csrfToken2 = csrfRes2.body.csrfToken;

    // 4️⃣ Login (this sets cookie)
    await agent
      .post("/api/auth/login")
      .set("x-csrf-token", csrfToken2)
      .send({
        email: "tahasayyedk00@gmail.com",
        password: "Taha@786"
      })
      .expect(200);

    // 5️⃣ Call protected route
    const res = await agent
      .get("/api/auth/profile")
      .expect(200);

    // 6️⃣ Assertions
    expect(res.body).toHaveProperty("email", "tahasayyedk00@gmail.com");
  });
  it("should fail if no token provided", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .expect(401);

    expect(res.body.message).toBe("No access token provided");
  });
  it("should fail with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Cookie", ["accessToken=invalidtoken"])
      .expect(401);

    expect(res.body.message).toBe("Invalid access token");
  });

});