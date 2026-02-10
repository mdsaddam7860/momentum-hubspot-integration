import { logger } from "../index.js";
import cron from "node-cron";
import { syncProspectContact } from "../Controller/syncProspectContact.js";

let isRunning = false;
let counter = 1;

// 1 Second
// cron.schedule(" */1 * * * * *", async () => {
//     logger.info(`🚀 Cron started : ${counter}`);
//     counter++;
//     // await syncContactMomentum();
//     // logger.info("✅ Cron finished");
// });

// 1 Hour
// cron.schedule("0 0 */1 * * *", async () => {
//     logger.info(`🚀 Cron started : ${counter}`);
//     counter++;
//     // await syncContactMomentum();
//     // logger.info("✅ Cron finished");
// });

// 15min
logger.info(`Every 15 min Schedular Intialized`);

cron.schedule("0 */15 * * * *", async () => {
  try {
    logger.info(`Every 15 min Schedular Started `);

    await syncProspectContact();
    logger.info("✅ Cron finished");
  } catch (error) {
    logger.error("❌ Cron error:", error);
  }
});

// if (isRunning) {
//     console.log("⏳ Previous job still running, skipping...");
//     return;
//   }

//   isRunning = true;

//   try {
//     console.log("🚀 Cron started");
//     await syncInquirer();
//     console.log("✅ Cron finished");
//   } catch (error) {
//     console.error("❌ Cron error:", error);
//   } finally {
//     isRunning = false;
//   }
