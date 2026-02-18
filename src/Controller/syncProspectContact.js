import { logger, getAllContacts, buildInsuredPayload } from "../index.js";
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
import { searchLifestageContacts } from "../service/momentum.service.js";
import { SearchProspectsMomentum } from "../service/momentum.service.js";
import { insertProspectInMomentum } from "../service/momentum.service.js";
import { buildProspectsPayload } from "../utils/helper.js";
import { insertPrincipal } from "../service/momentum.service.js";
import { buildPrincipalPayload } from "../utils/helper.js";

async function syncProspectContact() {
  try {
    const accessToken = await getAccessToken();

    const contacts = await searchLifestageContacts();
    logger.info(`Lifestage Contacts:${JSON.stringify(contacts.length)}`);

    for (const contact of contacts) {
      try {
        if (contact.id !== "203328780453") {
          // logger.info(
          //   `Contact ${JSON.stringify(contact, null, 2)} | Stage: ${
          //     contact.properties?.lifecyclestage
          //   }`
          // );
          continue;
        }
        const lifecycleStage = contact.properties?.lifecyclestage;

        // Skip if no lifecycle stage
        if (!lifecycleStage) {
          continue;
        }
        // for prospects
        if (
          lifecycleStage === "marketingqualifiedlead" ||
          lifecycleStage === "salesqualifiedlead" ||
          lifecycleStage === "opportunity" ||
          lifecycleStage === "customer"
        ) {
          logger.info(
            `Contact ${JSON.stringify(
              contact,
              null,
              2
            )} | Stage: ${lifecycleStage}`
          );
          // search associated company
          const associatedCompany = await getAssociatedCompanyByContactId(
            contact?.id
          );

          // logger.info(
          //   `Associated Company ${JSON.stringify(associatedCompany)}`
          // );
          let payload;
          if (!associatedCompany) {
            logger.info(
              `No associated company found for contact ID:${JSON.stringify(
                contact?.id
              )} creating insured in momentum`
            );
            // create insured in momentum update contact in hubspot
            // Build payload
            payload = buildInsuredPayload(contact);
          } else {
            let company = null;
            if (associatedCompany?.id) {
              company = await getCompanyById(associatedCompany.id);
              if (!company) {
                logger.info(`No company found for contact ID:${contact.id}`);
              }
              logger.info(`Company ${JSON.stringify(company)}`);
            }

            // Build payload
            payload = buildProspectsPayload(contact, company);
          }

          if (!payload) {
            logger.warn(`Payload is null :${JSON.stringify(payload)}`);
            continue;
          }
          logger.info(`Payload:${JSON.stringify(payload)}`);

          // Update and Create Prospect
          const prospect = await insertProspectInMomentum(payload, accessToken);
          logger.info(` prospect in Momentum ${JSON.stringify(prospect)}`);

          // Update sourceId

          let updatedContact = null;
          updatedContact = await updateContactById(contact.id, prospect);
          logger.info(
            `Contact updated successfully ${JSON.stringify(updatedContact)}`
          );
          // buit principal payload
          // const principalPayload = buildPrincipalPayload(
          //   contact,
          //   prospect.insuredDatabaseId
          // );
          // logger.info(`Principal Payload:${JSON.stringify(principalPayload)}`);

          // Insrert Principal
          // const principalResponse = await insertPrincipal(
          //   principalPayload,
          //   accessToken
          // );
          // logger.info(
          //   `➡️ Principal in Momentum ${JSON.stringify(principalResponse)}`
          // );
        }
        //-----------------------------------------------------------------------------------------------
        // for customer
        // if (lifecycleStage === "customer") {
        //   logger.info(
        //     `Contact ${JSON.stringify(
        //       contact,
        //       null,
        //       2
        //     )} | Stage: ${lifecycleStage}`
        //   );
        //   // search associated company
        //   const associatedCompany = await getAssociatedCompanyByContactId(
        //     contact?.id
        //   );

        //   logger.info(
        //     `Associated Company ${JSON.stringify(associatedCompany, null, 2)}`
        //   );
        //   if (!associatedCompany) {
        //     logger.info(
        //       `No associated company found for contact ID:${JSON.stringify(
        //         contact?.id
        //       )}`
        //     );
        //   }

        //   let company = null;
        //   if (associatedCompany?.id) {
        //     company = await getCompanyById(associatedCompany.id);
        //     logger.info(`Company ${JSON.stringify(company)}`);
        //   }

        //   // build payload for customer

        //   const payload = buildMomentumContactPayload(contact, company);
        //   // if (!payload) {
        //   //   logger.warn(`Payload is null for contact ID:${contact}`);
        //   //   continue;
        //   // }
        //   logger.info(` Insured Payload:${JSON.stringify(payload)}`);

        //   // Create and Update Customer
        //   const insured = await insertProspectInMomentum(payload, accessToken);
        //   logger.info(` Insured in Momentum ${JSON.stringify(insured)}`);

        //   // Update sourceId

        //   let updatedContact = null;
        //   updatedContact = await updateContactById(contact.id, insured);
        //   logger.info(
        //     `Contact updated successfully ${JSON.stringify(
        //       updatedContact,
        //       null,
        //       2
        //     )}`
        //   );

        //   // buit principal payload
        //   const principalPayload = buildPrincipalPayload(
        //     contact,
        //     insured.insuredDatabaseId
        //   );
        //   logger.info(
        //     `Principal Payload:${JSON.stringify(principalPayload, null, 2)}`
        //   );

        //   // Insrert Principal
        //   const principalResponse = await insertPrincipal(
        //     principalPayload,
        //     accessToken
        //   );
        //   logger.info(
        //     `➡️ Principal in Momentum ${JSON.stringify(
        //       principalResponse,
        //       null,
        //       2
        //     )}`
        //   );
        // }

        return; // TODO Remove after testing one contact
      } catch (error) {
        logger.error(`Error syncing Contact ID ${contact}:`, error);
      }
    }
  } catch (error) {
    logger.error(`❌ Error in  syncProspectContact:`, error);
  }
}

export { syncProspectContact };
