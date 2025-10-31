import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@highwaydelite.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@highwaydelite.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      username: "testuser",
      email: "user@test.com",
      password: hashedPassword,
      role: "user",
    },
  });

  const experiences = await prisma.package.createMany({
    data: [
      {
        title: "Mountain Trek Adventure",
        description:
          "Experience the thrill of trekking through scenic mountain trails with breathtaking views.",
        price: 5999,
        location: "Himalayas",
        duration: 5,
        availableSlots: 15,
        itinerary:
          "Day 1: Arrival and acclimatization\nDay 2-3: Trek to base camp\nDay 4: Summit attempt\nDay 5: Return journey",
        inclusions: "Accommodation, Meals, Guide, Permits, Equipment",
        exclusions: "Travel insurance, Personal expenses, Tips",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e",
        ],
        preferedPaymentMethod: ["online"],
      },
      {
        title: "Beach Paradise Getaway",
        description:
          "Relax on pristine beaches with crystal clear waters and luxury accommodations.",
        price: 8999,
        location: "Goa",
        duration: 4,
        availableSlots: 20,
        itinerary:
          "Day 1: Check-in and beach relaxation\nDay 2: Water sports and beach activities\nDay 3: Explore local markets and nightlife\nDay 4: Checkout",
        inclusions:
          "Beach resort stay, Breakfast, Water sports equipment, Airport transfers",
        exclusions: "Lunch and dinner, Alcohol, Personal expenses",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
        ],
        preferedPaymentMethod: ["online"],
      },
      {
        title: "Desert Safari Experience",
        description:
          "Explore the vast desert landscapes with camel rides and traditional camping.",
        price: 4499,
        location: "Rajasthan",
        duration: 3,
        availableSlots: 12,
        itinerary:
          "Day 1: Arrival and camel safari\nDay 2: Desert camping and cultural performances\nDay 3: Sunrise view and departure",
        inclusions: "Camel ride, Desert camping, Meals, Cultural show, Guide",
        exclusions: "Transportation to Rajasthan, Personal expenses",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1509316785289-025f5b846b35",
          "https://images.unsplash.com/photo-1564507592333-c60657eea523",
        ],
        preferedPaymentMethod: ["cash"],
      },
      {
        title: "City Cultural Tour",
        description:
          "Discover rich history and vibrant culture in ancient cities with expert guides.",
        price: 3499,
        location: "Delhi",
        duration: 2,
        availableSlots: 25,
        itinerary:
          "Day 1: Historical monuments tour (Red Fort, Qutub Minar)\nDay 2: Museums and local markets",
        inclusions: "Transport, Guide, Entry fees, Lunch",
        exclusions: "Hotel accommodation, Dinner, Shopping",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
          "https://images.unsplash.com/photo-1587474260584-136574528ed5",
        ],
        preferedPaymentMethod: ["online"],
      },
      {
        title: "Wildlife Safari",
        description:
          "Get up close with exotic wildlife in their natural habitat on guided safaris.",
        price: 12999,
        location: "Jim Corbett",
        duration: 4,
        availableSlots: 10,
        itinerary:
          "Day 1: Check-in and orientation\nDay 2-3: Morning and evening jeep safaris\nDay 4: Bird watching and departure",
        inclusions:
          "Resort stay, All meals, Safari rides, Naturalist guide, Park entry fees",
        exclusions: "Travel to Jim Corbett, Alcohol, Camera fees",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801",
          "https://images.unsplash.com/photo-1549366021-9f761d450615",
        ],
        preferedPaymentMethod: ["splitPaymentOnline"],
      },
      {
        title: "River Rafting Adventure",
        description:
          "Navigate through exciting rapids and enjoy the adrenaline rush of white water rafting.",
        price: 2999,
        location: "Rishikesh",
        duration: 1,
        availableSlots: 30,
        itinerary:
          "Morning: Safety briefing and equipment\nAfternoon: 16km rafting expedition with grade 3-4 rapids\nEvening: Beach camping and bonfire",
        inclusions:
          "Rafting equipment, Safety gear, Professional guide, Beach camping, Meals",
        exclusions: "Transportation to Rishikesh, Personal expenses",
        thumbnailImages: [
          "https://images.unsplash.com/photo-1527004013197-933c4bb611b3",
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        ],
        preferedPaymentMethod: ["online"],
      },
    ],
    skipDuplicates: true,
  });

  const coupons = await prisma.coupon.createMany({
    data: [
      {
        packageId: 1,
        code: "TREK10",
        discountPercentage: 10,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
      {
        packageId: 2,
        code: "BEACH20",
        discountPercentage: 20,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
      {
        packageId: 3,
        code: "DESERT15",
        discountPercentage: 15,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
      {
        packageId: 4,
        code: "CULTURE25",
        discountPercentage: 25,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
      {
        packageId: 5,
        code: "WILDLIFE30",
        discountPercentage: 30,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
      {
        packageId: 6,
        code: "RAFTING5",
        discountPercentage: 5,
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
  console.log({ admin, user, experiences, coupons });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
