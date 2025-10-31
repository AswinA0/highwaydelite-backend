import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { router as authRouter } from "./routes/auth.routes.js";
import { router as adminRouter } from "./routes/admin.routes.js";
import { router as packagesRouter } from "./routes/packages.routes.js";
import { router as orderRouter } from "./routes/order.routes.js";
import { ErrorHandlingMiddleWare } from "./middleware/errorHandlingMiddleware.js";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/experiences", packagesRouter);
app.use("/api/order", orderRouter);

app.use(ErrorHandlingMiddleWare);

// Export for Vercel serverless
export default app;
