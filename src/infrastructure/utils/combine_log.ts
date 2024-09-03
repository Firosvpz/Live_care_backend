// Create a Logger file for Log the entire Application
import { createLogger, format, transports } from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = format;

// Log format
const log_format = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create Logger
const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), log_format),

  transports: [
    // Single log file for all logs (including errors)
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/combine_log.ts"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // Console output (for development)
    new transports.Console({
      format: combine(colorize(), log_format),
    }),
  ],
});

export { logger };
