import "dotenv/config";
import { app } from "./src/app.js";
import { logger } from "./src/index.js";

import { syncProspectContact } from "./src/Controller/syncProspectContact.js";
// import { syncDealsQuoteMomentum } from "./src/Controller/DealsQuoteMomentum.js";

// import { getAccessToken } from "./src/service/momentum.service.js";

// import "./src/crons/cronScheduler.js";

// console.log("Loaded Token:", process.env.HUBSPOT_API_ACCESS_TOKEN); // debug

const PORT = process.env.PORT || 3250;

app.listen(PORT, async function () {
  logger.info(`Listening on port ${PORT}`);
});
syncProspectContact();
