import { describe, jest } from "@jest/globals";
import { } from "../../lib/cloudinary.js"

//Mock Cloudinary
jest.unstable_mockModule("../../lib/cloudinary.js", () => ({
    default: {
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: "https://example.com/products/test.jpg",
            }),
            destroy: jest.fn().mockResolvedValue({}),
        },
    },
}));


//Mock Redis
jest.unstable_mockModule("../../lib/redis.js", () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null), // force DB path
        set: jest.fn().mockResolvedValue(),
    },
}));


//imports
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { clearDatabase } from "./clearDB.js";
import { ENV } from "../../lib/env.js"
import { connectDB } from "./db_test.js"

const Product = (await import("../../models/product.model.js")).default;
const User = (await import("../../models/user.model.js")).default;

let agent;

beforeAll(async () => {
    await connectDB();
    agent = request.agent(app);
});

afterEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});

const getCSRF = async () => {
    const res = await agent.get("/api/products/csrf-token");
    return res.body.csrfToken;
};

const setupAdmin = async () => {
    const csrf = await getCSRF();

    await agent
        .post("/api/auth/signup")
        .set("x-csrf-token", csrf)
        .send({
            name: "Admin",
            email: "tahasayyedk00@gmail.com",
            password: "Taha@786",
        });

    // 🔥 Make user admin
    await User.findOneAndUpdate(
        { email: "tahasayyedk00@gmail.com" },
        { role: "admin" }
    );

    const csrf2 = await getCSRF();

    await agent
        .post("/api/auth/login")
        .set("x-csrf-token", csrf2)
        .send({
            email: "tahasayyedk00@gmail.com",
            password: "Taha@786",
        });
};


describe("Product Integration", () => {
    it("should create product (admin only)", async () => {
        await setupAdmin();

        const csrf = await getCSRF();

        const res = await agent
            .post("/api/products")
            .set("x-csrf-token", csrf)
            .send({
                name: "Test Product",
                description: "desc",
                price: 100,
                image: "base64image",
                category: "test",
            })
            .expect(201);

        expect(res.body).toHaveProperty("name", "Test Product");

        const productInDB = await Product.findOne({ name: "Test Product" });
        expect(productInDB).toBeTruthy();
    });
    it("should get featured products (DB fallback)", async () => {
        await Product.create({
            name: "Featured",
            description: "desc",
            price: 100,
            image: "img",
            category: "test",
            isFeatured: true,
        });

        const res = await request(app)
            .get("/api/products/featured")
            .expect(200);

        expect(res.body.length).toBe(1);
    });
    // it("should toggle featured product", async () => {
    //     await setupAdmin();

    //     const product = await Product.create({
    //         name: "Toggle",
    //         description: "desc",
    //         price: 100,
    //         image: "img",
    //         category: "test",
    //         isFeatured: false,
    //     });

    //     const csrf = await getCSRF();

    //     const res = await agent
    //         .patch(`/api/products/${product._id}`)
    //         .set("csrf-token", csrf)
    //         .expect(200);

    //     expect(res.body.isFeatured).toBe(true);
    // });
})