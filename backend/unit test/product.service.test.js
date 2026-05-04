import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js";


// mock Product model
jest.unstable_mockModule("../models/product.model.js", () => ({
    default: {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
    },
}))

// mock redis
jest.unstable_mockModule("../lib/redis.js", () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
    }
}));

// mock cloudinary
jest.unstable_mockModule("../lib/cloudinary.js", () => ({
    default: {
        uploader: {
            upload: jest.fn(),
            destroy: jest.fn(),
        }
    }
}));


const Product = (await import("../models/product.model.js")).default;
const { redis } = await import("../lib/redis.js");
const cloudinary = (await import("../lib/cloudinary.js")).default;

const {
    getAllProductsFromDB,
    getFeaturedProductsFromDB,
    getProductsByCategoryFromDB,
    getProductsSampleFromDB,
    uploadImagesToStore,
    setProducts,
    deleteProductByID,
} = await import("../service/product.service.js");


describe("getAllProductsFromDB", () => {

    it("should return all products", async () => {
        const mockProducts = [{ name: "A" }];

        Product.find.mockResolvedValue(mockProducts);

        const result = await getAllProductsFromDB();

        expect(Product.find).toHaveBeenCalledWith({});
        expect(result).toEqual(mockProducts);
    });

    it("should throw if DB fails", async () => {
        Product.find.mockRejectedValue(new Error());

        await expect(getAllProductsFromDB())
            .rejects.toThrow("Failed to fetch products from database");
    });

});


describe("getFeaturedProductsFromDB", () => {

    it("should return featured products", async () => {
        const mockProducts = [{ isFeatured: true }];

        Product.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockProducts)
        });

        const result = await getFeaturedProductsFromDB();

        expect(result).toEqual(mockProducts);
    });

});

describe("getProductsSampleFromDB", () => {

    it("should return sampled products", async () => {
        const mockProducts = [{ name: "sample" }];

        Product.aggregate.mockResolvedValue(mockProducts);

        const result = await getProductsSampleFromDB(5);

        expect(Product.aggregate).toHaveBeenCalled();
        expect(result).toEqual(mockProducts);
    });

});

describe("uploadImagesToStore", () => {

    it("should upload image and return response", async () => {
        const mockResponse = { secure_url: "url" };

        cloudinary.uploader.upload.mockResolvedValue(mockResponse);

        const result = await uploadImagesToStore("image");

        expect(result).toEqual(mockResponse);
    });

    it("should return null if no image", async () => {
        const result = await uploadImagesToStore(null);

        expect(result).toBeNull();
    });

});

describe("setProducts", () => {

    it("should create product with uploaded image", async () => {
        cloudinary.uploader.upload.mockResolvedValue({
            secure_url: "image-url"
        });

        Product.create.mockResolvedValue({ name: "Test" });

        const result = await setProducts(
            "Test",
            "desc",
            100,
            "image",
            "category"
        );

        expect(Product.create).toHaveBeenCalledWith(
            expect.objectContaining({
                image: "image-url"
            })
        );

        expect(result).toEqual({ name: "Test" });
    });

    it("should handle upload failure", async () => {
        cloudinary.uploader.upload.mockRejectedValue(new Error());

        await expect(
            setProducts("Test", "desc", 100, "img", "cat")
        ).rejects.toThrow("Failed to store image to Store");
    });

});

describe("deleteProductByID", () => {

    it("should delete product", async () => {
        Product.findByIdAndDelete.mockResolvedValue();

        await deleteProductByID("123");

        expect(Product.findByIdAndDelete).toHaveBeenCalledWith("123");
    });

});