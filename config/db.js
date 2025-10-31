import { PrismaClient } from "@prisma/client";
if (process.env.NODE_ENV === "production") {
  global.prisma = new PrismaClient();
}
const prisma = global.prisma || new PrismaClient();
export default prisma;
