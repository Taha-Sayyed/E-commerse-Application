import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js"

//  mock FIRST
jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
        verify: jest.fn(),
        sign: jest.fn(),
    },
}));

jest.unstable_mockModule("../lib/redis.js", () => ({
    redis: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    }
}));

jest.unstable_mockModule("../models/user.model.js", () => ({
    default: {
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));


// Mocking the service itself is removed to test the actual implementation.




//  THEN import dynamically
const jwt = (await import("jsonwebtoken")).default;
const User = (await import("../models/user.model.js")).default;

const {
    verifyAccessToken,
    getUserFromToken,
    refreshAccessTokenService,
    findUserByEmail,
    createNewUser,
    comparePasswordAuth


} = await import("../service/auth.service.js");
const { redis } = await import("../lib/redis.js");



describe("verifyAccessToken", () => {
    it("should return decoded token when valid", () => {
        const mockDecoded = { userId: "123" };

        jwt.verify.mockReturnValue(mockDecoded);

        const result = verifyAccessToken("validToken");

        expect(jwt.verify).toHaveBeenCalledWith(
            "validToken",
            expect.any(String)
        );

        expect(result).toEqual(mockDecoded);
    });
    it("should throw AppError if token is expired", () => {
        jwt.verify.mockImplementation(() => {
            const err = new Error("Expired");
            err.name = "TokenExpiredError";
            throw err;
        });

        expect(() => verifyAccessToken("expiredToken"))
            .toThrow(new AppError("Access token expired", 401));
    });
    it("should throw AppError if token is invalid", () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid");
        });

        expect(() => verifyAccessToken("invalidToken"))
            .toThrow(new AppError("Invalid access token", 401));
    });
});

describe("getUserFromToken", () => {

    it("should return user when token is valid", async () => {
        const mockUser = { _id: "123", name: "Test" };

        // mock jwt verify
        jwt.verify.mockReturnValue({ userId: "123" });

        // mock mongoose chain
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        const result = await getUserFromToken("validToken");

        expect(result).toEqual(mockUser);
    });
    it("should throw error if user not found", async () => {
        jwt.verify.mockReturnValue({ userId: "123" });

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await expect(getUserFromToken("validToken"))
            .rejects.toThrow("User not found");
    });
});

describe("refreshAccessTokenService", () => {

    it("should return new tokens when valid", async () => {
        jwt.verify.mockReturnValue({ userId: "123" });

        redis.get.mockResolvedValue("validRefreshToken");

        jwt.sign
            .mockReturnValueOnce("newAccessToken")
            .mockReturnValueOnce("newRefreshToken");

        redis.set.mockResolvedValue();

        const result = await refreshAccessTokenService("validRefreshToken");

        expect(result).toEqual({
            accessToken: "newAccessToken",
            refreshToken: "newRefreshToken"
        });
    });
    it("should throw if no refresh token provided", async () => {
        await expect(refreshAccessTokenService(null))
            .rejects.toThrow("No refresh token provided");
    });
    it("should throw if session expired", async () => {
        jwt.verify.mockReturnValue({ userId: "123" });

        redis.get.mockResolvedValue(null);

        await expect(refreshAccessTokenService("token"))
            .rejects.toThrow("Session expired");
    });
    it("should throw if token mismatch", async () => {
        jwt.verify.mockReturnValue({ userId: "123" });

        redis.get.mockResolvedValue("differentToken");

        await expect(refreshAccessTokenService("token"))
            .rejects.toThrow("Invalid refresh token");
    });
    it("should throw if storing refresh token fails", async () => {
        jwt.verify.mockReturnValue({ userId: "123" });

        redis.get.mockResolvedValue("validRefreshToken");

        jwt.sign
            .mockReturnValueOnce("newAccessToken")
            .mockReturnValueOnce("newRefreshToken");

        redis.set.mockRejectedValue(new Error());

        await expect(refreshAccessTokenService("validRefreshToken"))
            .rejects.toThrow("Failed to update refresh token");
    });


});

describe("findUserByEmail", () => {

    it("should return user if found", async () => {
        const mockUser = { email: "test@example.com" };

        User.findOne.mockResolvedValue(mockUser);

        const result = await findUserByEmail("TEST@EXAMPLE.COM");

        expect(User.findOne).toHaveBeenCalledWith({
            email: "test@example.com"
        });

        expect(result).toEqual(mockUser);
    });

    it("should throw if DB fails", async () => {
        User.findOne.mockRejectedValue(new Error());

        await expect(findUserByEmail("test@example.com"))
            .rejects.toThrow("Failed to find user");
    });

});

describe("createNewUser", () => {

    it("should create user successfully", async () => {
        const mockUser = { name: "Test" };

        User.create.mockResolvedValue(mockUser);

        const result = await createNewUser("Test", "test@example.com", "password");

        expect(result).toEqual(mockUser);
    });

    it("should handle password validation error", async () => {
        User.create.mockRejectedValue(
            new Error("User validation failed: password: Password must be at least 6 characters long")
        );

        await expect(
            createNewUser("Test", "test@example.com", "123")
        ).rejects.toThrow("Password must be at least 6 characters long");
    });

    it("should throw generic error for other failures", async () => {
        User.create.mockRejectedValue(new Error("Random error"));

        await expect(
            createNewUser("Test", "test@example.com", "password")
        ).rejects.toThrow("Failed to create user");
    });

});

describe("comparePasswordAuth", () => {

    it("should return true if password matches", async () => {
        const mockUser = {
            comparePassword: jest.fn().mockResolvedValue(true)
        };

        const result = await comparePasswordAuth(mockUser, "password");

        expect(mockUser.comparePassword).toHaveBeenCalledWith("password");
        expect(result).toBe(true);
    });

    it("should throw if compare fails", async () => {
        const mockUser = {
            comparePassword: jest.fn().mockRejectedValue(new Error())
        };

        await expect(
            comparePasswordAuth(mockUser, "password")
        ).rejects.toThrow("Failed to compare password");
    });

});

describe("comparePasswordAuth", () => {

    it("should return true if password matches", async () => {
        const mockUser = {
            comparePassword: jest.fn().mockResolvedValue(true)
        };

        const result = await comparePasswordAuth(mockUser, "password");

        expect(mockUser.comparePassword).toHaveBeenCalledWith("password");
        expect(result).toBe(true);
    });

    it("should throw if compare fails", async () => {
        const mockUser = {
            comparePassword: jest.fn().mockRejectedValue(new Error())
        };

        await expect(
            comparePasswordAuth(mockUser, "password")
        ).rejects.toThrow("Failed to compare password");
    });

});