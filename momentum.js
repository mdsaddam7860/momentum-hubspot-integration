import "dotenv/config";
// import dotenv from "dotenv";

import { app, logger, getHubspotContacts, getHubspotCompanies,createCompanyInMomentum,
  hubspotToMomentumsync,fetchAllCustomerToMomentum} from "./src/index.js";
  import { syncHubspotToMomentum } from "./src/Controller/sycHubspotToMomentum.js";
  import { syncContactMomentum } from "./src/Controller/syncContactMomentum.js";
  import { syncProspectContact } from "./src/Controller/syncProspectContact.js";
  import{syncDealsQuoteMomentum}from "./src/Controller/DealsQuoteMomentum.js"
  import "./src/crons/cronScheduler.js";
  
import { getAccessToken } from "./src/service/momentum.service.js";

import "./src/crons/cronScheduler.js";

// console.log("Loaded Token:", process.env.HUBSPOT_API_ACCESS_TOKEN); // debug



const PORT = process.env.PORT || 5000;

app.listen(PORT, async function () {
  // getHubspotContacts();
  // getHubspotCompanies();
    //  createCompanyInMomentum();
    // hubspotToMomentumsync();
    // const contact = await getHubspotContacts();
    // console.log("final Contacts:", contact.length);
    // const token = await getAccessToken();
    //  const allcontacts = await fetchAllCustomerToMomentum(token);
    //  console.log("final Customers from Momentum:", allcontacts.length);
    // syncHubspotToMomentum();
    // syncContactMomentum();
    // syncProspectContact();
    // syncDealsQuoteMomentum();
  
    
    
  logger.info(`Listening on port ${PORT}`);
});
