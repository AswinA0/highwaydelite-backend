import { ErrorHandler } from "../error.js";
import prisma from "../config/db.js";
import { sendBookingConfirmation } from "../services/sendEmail.js";

export const getCouponsForPackage = async (req, res, next) => {
  const { packageId } = req.params;

  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        packageId: parseInt(packageId),
        validUntil: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        code: true,
        discountPercentage: true,
        validFrom: true,
        validUntil: true,
      },
    });

    return res.status(200).json({ coupons });
  } catch (error) {
    const err = new ErrorHandler(500, "Error fetching coupons");
    return next(err);
  }
};

export const validateCoupon = async (req, res, next) => {
  const { packageId, couponCode } = req.body;

  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        packageId: parseInt(packageId),
        code: couponCode,
      },
    });

    if (!coupon) {
      const err = new ErrorHandler(404, "Coupon not found");
      return next(err);
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      const err = new ErrorHandler(400, "Coupon not yet valid");
      return next(err);
    }

    if (coupon.validUntil < now) {
      const err = new ErrorHandler(400, "Coupon has expired");
      return next(err);
    }

    return res.status(200).json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    const err = new ErrorHandler(500, "Error validating coupon");
    return next(err);
  }
};

export const bookaPackage = async (req, res, next) => {
  const { packageId } = req.params;
  const userId = req.user.id;
  const { numberOfPeople, couponCode, paymentMethod, startDate } = req.body;

  try {
    const experience = await prisma.package.findUnique({
      where: { id: parseInt(packageId) },
    });

    if (!experience) {
      const err = new ErrorHandler(404, "Package not found");
      return next(err);
    }

    if (experience.availableSlots < numberOfPeople) {
      const err = new ErrorHandler(400, "Not enough slots available");
      return next(err);
    }

    let discountPercentage = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          packageId: parseInt(packageId),
          code: couponCode,
        },
      });

      if (
        !coupon ||
        coupon.validFrom > new Date() ||
        coupon.validUntil < new Date()
      ) {
        const err = new ErrorHandler(400, "Invalid or expired coupon code");
        return next(err);
      }

      discountPercentage = coupon.discountPercentage;
    }

    const basePrice = experience.price * numberOfPeople;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;

    // Calculate start and end dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + experience.duration);

    // Check for double booking - user shouldn't have overlapping bookings for the same package
    const existingBooking = await prisma.order.findFirst({
      where: {
        userId: userId,
        packageId: parseInt(packageId),
        OR: [
          {
            AND: [{ start: { lte: start } }, { end: { gte: start } }],
          },
          {
            AND: [{ start: { lte: end } }, { end: { gte: end } }],
          },
          {
            AND: [{ start: { gte: start } }, { end: { lte: end } }],
          },
        ],
      },
    });

    if (existingBooking) {
      const err = new ErrorHandler(
        400,
        `You already have a booking for this experience from ${existingBooking.start.toLocaleDateString()} to ${existingBooking.end.toLocaleDateString()}`
      );
      return next(err);
    }

    const order = await prisma.order.create({
      data: {
        packageId: parseInt(packageId),
        userId: userId,
        start: start,
        end: end,
        numberOfPeople: numberOfPeople,
        totalPrice: basePrice,
        yourPrice: finalPrice,
        status: "confirmed",
        paymentMethod: paymentMethod || "online",
        completed: false,
      },
    });

    await prisma.package.update({
      where: { id: parseInt(packageId) },
      data: {
        availableSlots: experience.availableSlots - numberOfPeople,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    try {
      await sendBookingConfirmation(user.email, {
        experienceName: experience.title,
        date: start,
        participants: numberOfPeople,
        totalAmount: finalPrice.toFixed(2),
        bookingId: order.id,
      });
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError);
    }

    return res.status(201).json({
      order,
      message: "Booking successful! Confirmation email sent.",
      savedAmount: discountAmount,
    });
  } catch (error) {
    console.error(error);
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            price: true,
            duration: true,
            thumbnailImages: true,
          },
        },
      },
      orderBy: {
        start: "desc",
      },
    });

    const now = new Date();

    const upcomingJourneys = orders.filter(
      (order) => new Date(order.start) > now
    );
    const pastJourneys = orders.filter((order) => new Date(order.start) <= now);

    return res.status(200).json({
      orders,
      upcomingJourneys,
      pastJourneys,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error(error);
    const err = new ErrorHandler(500, "Internal Server Error");
    return next(err);
  }
};
