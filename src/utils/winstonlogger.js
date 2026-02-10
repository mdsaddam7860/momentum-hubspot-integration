import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors, colorize } = format;

// Custom timestamp (12-hour)
const customTimestamp = timestamp({
  format: () =>
    new Date().toLocaleString("en-IN", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
});

// Console Log Format
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${level}] ${timestamp} - ${stack || message}`;
});

// File Log Format
const fileFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${level}] ${timestamp} - ${stack || message}`;
});

// Production Logger with Daily Rotate File
const productionLogger = () => {
  const dailyError = new transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
  });

  const dailyCombined = new transports.DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: process.env.LOG_LEVEL || "info",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
  });

  return createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(customTimestamp, errors({ stack: true })),
    defaultMeta: { service: "sfr-analytics-integration" },
    transports: [
      dailyCombined,
      dailyError,
      new transports.Console({
        format: combine(colorize(), customTimestamp, consoleFormat),
        level: "info",
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
    exceptionHandlers: [
      new transports.DailyRotateFile({
        filename: "logs/exceptions-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "14d",
        zippedArchive: true,
      }),
    ],
    rejectionHandlers: [
      new transports.DailyRotateFile({
        filename: "logs/rejections-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "14d",
        zippedArchive: true,
      }),
    ],
  });
};

// Development Logger
const logger =
  process.env.NODE_ENV === "production"
    ? productionLogger()
    : createLogger({
        level: "info",
        format: combine(customTimestamp, errors({ stack: true })),
        transports: [
          new transports.Console({
            format: combine(colorize(), customTimestamp, consoleFormat),
            handleExceptions: true,
            handleRejections: true,
          }),
          new transports.File({
            filename: "logs/development.log",
            format: fileFormat,
            level: "info",
            maxsize: 5 * 1024 * 1024,
            handleExceptions: true,
            handleRejections: true,
          }),
        ],
      });

export { logger };
