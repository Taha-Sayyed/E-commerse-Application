import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js";

jest.unstable_mockModule("../models/product.model.js", () => ({
    default: {
        find: jest.fn(),
    },
}));

const Product = (await import("../models/product.model.js")).default;

const {
    getCartProductsService,
    addToCartService,
    saveUserToDB,
} = await import("../service/cart.service.js");


describe("getCartProductsService", () => {

    it("should return cart products with quantity", async () => {
        const mockUser = {
            cartItems: [
                { product: "p1", quantity: 2 },
                { product: "p2", quantity: 1 }
            ]
        };

        const mockProducts = [
            {
                _id: "p1",
                toJSON: () => ({ name: "Product1" })
            },
            {
                _id: "p2",
                toJSON: () => ({ name: "Product2" })
            }
        ];

        Product.find.mockResolvedValue(mockProducts);

        const result = await getCartProductsService(mockUser);

        expect(Product.find).toHaveBeenCalledWith({
            _id: { $in: ["p1", "p2"] }
        });

        expect(result).toEqual([
            { name: "Product1", quantity: 2 },
            { name: "Product2", quantity: 1 }
        ]);
    });

    it("should ignore invalid cart items", async () => {
        const mockUser = {
            cartItems: [
                { product: null, quantity: 2 }, // invalid
                { product: "p1", quantity: 1 }
            ]
        };

        Product.find.mockResolvedValue([
            {
                _id: "p1",
                toJSON: () => ({ name: "Product1" })
            }
        ]);

        const result = await getCartProductsService(mockUser);

        expect(result).toEqual([
            { name: "Product1", quantity: 1 }
        ]);
    });

});


describe("addToCartService", () => {

    it("should add new product to cart", async () => {
        const mockUser = {
            cartItems: [],
            save: jest.fn().mockResolvedValue()
        };

        Product.find.mockResolvedValue([
            {
                _id: "p1",
                toJSON: () => ({ name: "Product1" })
            }
        ]);

        const result = await addToCartService("p1", mockUser);

        expect(mockUser.cartItems.length).toBe(1);
        expect(mockUser.save).toHaveBeenCalled();

        expect(result[0]).toEqual({
            name: "Product1",
            quantity: 1
        });
    });
    it("should increase quantity if product exists", async () => {
        const mockUser = {
            cartItems: [{ product: "p1", quantity: 1 }],
            save: jest.fn().mockResolvedValue()
        };

        Product.find.mockResolvedValue([
            {
                _id: "p1",
                toJSON: () => ({ name: "Product1" })
            }
        ]);

        const result = await addToCartService("p1", mockUser);

        expect(mockUser.cartItems[0].quantity).toBe(2);
        expect(result[0].quantity).toBe(2);
    });
    it("should throw if DB fails", async () => {
        const mockUser = {
            cartItems: [],
            save: jest.fn().mockRejectedValue(new Error())
        };

        await expect(addToCartService("p1", mockUser))
            .rejects.toThrow("Failed to add product in Cart");
    });

})

describe("saveUserToDB", () => {

    it("should save user successfully", async () => {
        const mockUser = {
            save: jest.fn().mockResolvedValue()
        };

        await saveUserToDB(mockUser);

        expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw AppError if save fails", async () => {
        const mockUser = {
            save: jest.fn().mockRejectedValue(new Error())
        };

        await expect(saveUserToDB(mockUser))
            .rejects.toThrow("Failed to save user in DB");
    });

});