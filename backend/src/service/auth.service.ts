import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JWT_CONFIG } from "../config/jwtConfig";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { createHttpError } from "../utils/httpError";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: "CANDIDATE" | "RECRUITER";
};

type LoginInput = {
  email: string;
  password: string;
};

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export const registerService = async ({
  name,
  email,
  password,
  role,
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw createHttpError(409, "User already registered");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: role === "RECRUITER" ? "RECRUITER" : "CANDIDATE",
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.userToken.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const sendUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { accessToken, refreshToken, sendUser };
};


export const loginService = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw createHttpError(403, "Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw createHttpError(403, "Invalid credentials");
  }

  await prisma.userToken.deleteMany({
    where: { userId: user.id },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.userToken.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const sendUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { accessToken, refreshToken, sendUser };
};

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw createHttpError(401, "Refresh token required");
  }

  const storedToken = await prisma.userToken.findUnique({
    where: { refreshToken },
    select: {
      userId: true,
      expiresAt: true,
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!storedToken) {
    throw createHttpError(401, "Refresh token invalid or already used");
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.userToken.delete({
      where: { refreshToken },
    });
    throw createHttpError(401, "Refresh token expired");
  }

  try {
    jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET);
  } catch {
    throw createHttpError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(storedToken.userId);
  const newRefreshToken = generateRefreshToken(storedToken.userId);

  await prisma.$transaction([
    prisma.userToken.delete({
      where: { refreshToken },
    }),
    prisma.userToken.create({
      data: {
        userId: storedToken.userId,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: storedToken.user,
  };
};

export const logoutService = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  await prisma.userToken.deleteMany({
    where: { refreshToken },
  });
};

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};
