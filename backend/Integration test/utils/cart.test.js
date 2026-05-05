import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { connectDB } from "./db_test.js";
import Product from "../../models/product.model.js";
import dns from "node:dns/promises";
import { clearDatabase } from "./clearDB.js";



beforeAll(async () => {
    dns.setServers(["1.1.1.1"]);
    await connectDB()
});

afterEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Cart Integration", () => {
    let productId;
    let agent = request.agent(app);

    //get CSRF Token
    const getCSRF = async () => {
        const res = await agent.get("/api/auth/csrf-token");
        return res.body.csrfToken;
    };

    //signup + login
    const setupUser = async () => {
        const csrf = await getCSRF();

        await agent
            .post("/api/auth/signup")
            .set("x-csrf-token", csrf)
            .send({
                name: "Taha",
                email: "tahaexample1@gmail.com",
                password: "Taha@786"
            });

        const csrf2 = await getCSRF();

        await agent
            .post("/api/auth/login")
            .set("x-csrf-token", csrf2)
            .send({
                email: "tahaexample1@gmail.com",
                password: "Taha@786"
            });
    };

    //create product
    const createProduct = async () => {
        const product = await Product.create({
            name: "Test Product",
            description: "desc",
            price: 100,
            image: "img",
            category: "test"
        });

        return product._id.toString();
    };

    //test

    it("should add product to cart", async () => {
        await setupUser();
        productId = await createProduct();

        const csrf = await getCSRF();

        const res = await agent
            .post("/api/cart")
            .set("x-csrf-token", csrf)
            .send({ productId })
            .expect(200);

        expect(res.body[0]).toHaveProperty("quantity", 1);
    });

    it("should get cart items", async () => {
        await setupUser();
        productId = await createProduct();

        const csrf = await getCSRF();

        await agent
            .post("/api/cart")
            .set("x-csrf-token", csrf)
            .send({ productId });

        const res = await agent
            .get("/api/cart")
            .expect(200);

        expect(res.body.length).toBe(1);
    });
    it("should update quantity", async () => {
        await setupUser();
        productId = await createProduct();

        const csrf1 = await getCSRF();

        await agent
            .post("/api/cart")
            .set("csrf-token", csrf1)
            .send({ productId });

        const csrf2 = await getCSRF();

        const res = await agent
            .put(`/api/cart/${productId}`)
            .set("csrf-token", csrf2)
            .send({ quantity: 3 })
            .expect(200);

        expect(res.body[0].quantity).toBe(3);
    });
    it("should remove item when quantity is 0", async () => {
        await setupUser();
        productId = await createProduct();

        const csrf1 = await getCSRF();

        await agent
            .post("/api/cart")
            .set("csrf-token", csrf1)
            .send({ productId });

        const csrf2 = await getCSRF();

        const res = await agent
            .put(`/api/cart/${productId}`)
            .set("csrf-token", csrf2)
            .send({ quantity: 0 })
            .expect(200);

        expect(res.body.length).toBe(0);
    });
    it("should fail without auth", async () => {
    const res = await request(app)
      .get("/api/cart")
      .expect(401);

    expect(res.body.message).toBe("No access token provided");
  });
})