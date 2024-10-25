import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import user_router from "./infrastructure/routes/user_routes";
import sp_router from "./infrastructure/routes/service_provider_routes";
import connectDB from "./infrastructure/config/mongodb";
import { logger } from "./infrastructure/utils/combine_log";
import admin_router from "./infrastructure/routes/admin_routes";
import paymentRouter from "./infrastructure/routes/payment_routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ["https://live-care.site"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/payment/webhook") {
    // Use express.raw() to parse the raw body needed for Stripe webhooks
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    // Use express.json() for all other routes
    express.json()(req, res, next);
  }
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.use("/api/user", user_router);
app.use("/api/sp", sp_router);
app.use("/api/admin", admin_router);
app.use("/api/payment", paymentRouter);
app.listen(PORT, () => {
  logger.info(`server started on port https://live-care.site`);
});
