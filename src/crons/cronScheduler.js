import { logger } from "../index.js";
import cron from "node-cron";
import { syncProspectContact } from "../Controller/syncProspectContact.js";

let isRunning = false;

logger.info(`➡️ Momentum Schedular Intialized....`);

cron.schedule("0 */15 * * * *", async () => {
  try {
    if (isRunning) {
      logger.info("⏳ Previous job still running, skipping...");
      return;
    }
    isRunning = true;
    logger.info(`Every hour Schedular Started `);

    await syncProspectContact();
    logger.info("✅ Momentum Scheduler finished Executing");
  } catch (error) {
    logger.error("❌ Scheduler error:", error);
  } finally {
    isRunning = false;
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
