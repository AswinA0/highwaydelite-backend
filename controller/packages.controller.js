import { ErrorHandler } from "../error.js";
import prisma from "./../config/db.js";
export const getAllPackages = async (req, res, next) => {
  const { page = 1, limit = 8 } = req.query;
  const skip = (page - 1) * limit;
  try {
    console.log("Fetching packages with pagination:", { page, limit, skip });
    const packages = await prisma.package.findMany({
      include: { reviews: true },
      take: parseInt(limit),
      skip: skip,
    });
    const totalPackages = await prisma.package.count();
    return res.status(200).json({
      experiences: packages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Math.ceil(totalPackages / limit),
      },
    });
  } catch (error) {
    console.error(error);
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};

export const getPackageById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const experience = await prisma.package.findUnique({
      where: { id: parseInt(id) },
      include: { reviews: true },
    });
    if (!experience) {
      const err = new ErrorHandler(404, "Experience not found");
      return next(err);
    }
    return res.status(200).json({ package: experience });
  } catch (error) {
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};

export const favAPackage = async (req, res, next) => {
  const userId = req.user.id;
  const { packageId } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favourites: {
          connect: { id: parseInt(packageId) },
        },
      },
      include: { favourites: true },
    });
    return res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};

export const unfavAPackage = async (req, res, next) => {
  const userId = req.user.id;
  const { packageId } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        favourites: {
          disconnect: { id: parseInt(packageId) },
        },
      },
      include: { favourites: true },
    });
    return res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};

export const getFavourites = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { favourites: true },
    });
    return res.status(200).json({ favourites: user.favourites });
  } catch (error) {
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};
