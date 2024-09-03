import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import user_router from "./infrastructure/routes/user_routes";
import sp_router from "./infrastructure/routes/service_provider_routes"
import connectDB from "./infrastructure/config/mongodb";
import { logger } from "./infrastructure/utils/combine_log";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

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

app.use("/user", user_router);
app.use("/sp",sp_router)

app.listen(PORT, () => {
  logger.info(`server started on http://localhost:${PORT}`);
});
