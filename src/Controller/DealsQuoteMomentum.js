import { logger, getAllContacts } from "../index.js";
import { buildMomentumContactPayload } from "../utils/helper.js";
import { getContactsModifiedLast1Hour } from "../service/momentum.service.js";
import { getAccessToken } from "../service/momentum.service.js";
import { createContactInMomentum } from "../service/hubspot.js";
import { searchContractBySourceId } from "../service/momentum.service.js";
import { getAssociatedCompanyByContactId } from "../service/hubspot.js";
import { updateContactById } from "../service/momentum.service.js";
import { getCompanyById } from "../service/momentum.service.js";
import { fetchContactsWithSourceGroup } from "../service/momentum.service.js";
import { insertInsuredContact } from "../service/momentum.service.js";
import{getAssociatedContactsByDealId}from "../service/hubspot.js"
import{getContactById}from "../service/momentum.service.js"
import{SearchdatabaseIdInMomentum}from "../service/momentum.service.js";
import{buildQuotePayload}from "../utils/helper.js"
import{insertQuoteInMomentum}from "../service/momentum.service.js"



import { getAllHubSpotDeals } from "../service/hubspot.js";


async function syncDealsQuoteMomentum() {
  try {
        const accessToken = await getAccessToken();
    // call The Deal function in Hubspot

    const deals = await getAllHubSpotDeals();
    logger.info(`All Deals:${JSON.stringify(deals.length)}`);
    // logger.info (`Deal ${JSON.stringify(deals[0], null,2 )}`)
    // return; // todo remove after testing

    // search associated contact for each deal
    for (const deal of deals) {
      try {
        logger.info(`Processing Deal ID:${JSON.stringify(deal, null, 2)}`);
        // search associated contact
        const associatedContact = await getAssociatedContactsByDealId(
          deal?.id,
        );

        logger.info(
          `Associated Contact ${JSON.stringify(associatedContact, null, 2)}`,
        );
        if (!associatedContact) {
          logger.info(
            `No associated contact found for contact ID:${deal.id}`,
          );
          continue;
        }

        let contact = null;
        if (associatedContact?.toObjectId) {
          contact = await getContactById(associatedContact.toObjectId);

          logger.info(`Contact ${JSON.stringify(contact, null, 2)}`);
        }
        // contact found by email
        if (contact?.properties?.email) {
          const email = contact?.properties?.email;
          logger.info(`Contact Email:${JSON.stringify(email)}`);

          // Search Email based on database ID in Momentum
          const databaseId = await SearchdatabaseIdInMomentum(email,accessToken);
          logger.info(`Momentum Database ID:${JSON.stringify(databaseId,null,2)}`);


          // Build Payload for Deal'
          const payload = buildQuotePayload(contact, deal, databaseId.databaseId);
          logger.info(`Quote Payload:${JSON.stringify(payload, null, 2)}`);

          // Insert/Update Quote in momentum

         const dealResponse = await insertQuoteInMomentum({payload,accessToken});
          logger.info(`Inserted Quote DealResponse: ${JSON.stringify(dealResponse, null, 2)}`);

          
          return;

        }

      } catch (error) {
        logger.error(`Error processing deal ID:${deal.id}`, error);
      }
    }
    // Build payload for deals
  } catch (error) {
    logger.error("Error syncing DealsQuoteMomentum:", error);
  }
}

//new code

export { syncDealsQuoteMomentum };
