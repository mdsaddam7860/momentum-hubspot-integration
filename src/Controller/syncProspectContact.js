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
import { searchLifestageContacts } from "../service/momentum.service.js";
import { SearchProspectsMomentum } from "../service/momentum.service.js";
import { insertProspectInMomentum } from "../service/momentum.service.js";
import { buildProspectsPayload } from "../utils/helper.js";
import { insertPrincipal } from "../service/momentum.service.js";
import { buildPrincipalPayload } from "../utils/helper.js";

async function syncProspectContact() {
  try {
    const accessToken = await getAccessToken();

    //
    const lifestageContacts = await searchLifestageContacts();
    logger.info(
      `Lifestage Contacts:${JSON.stringify(lifestageContacts.length)}`,
    );

    for (const contact of lifestageContacts) {
      try {
        const lifecycleStage = contact.properties?.lifecyclestage;

        // Skip if no lifecycle stage
        if (!lifecycleStage) {
          continue;
        }
        // for prospects
        if (
          lifecycleStage === "marketingqualifiedlead" ||
          lifecycleStage === "structuredquerylanguage" ||
          lifecycleStage === "opportunity"
        ) {
          logger.info(
            `Processing contact ID ${JSON.stringify(contact.id, null, 2)} | Stage: ${lifecycleStage}`,
          );

          // search associated company
          const associatedCompany = await getAssociatedCompanyByContactId(
            contact?.id,
          );

          logger.info(
            `Associated Company ${JSON.stringify(associatedCompany, null, 2)}`,
          );
          if (!associatedCompany) {
            logger.info(
              `No associated company found for contact ID:${contact.id}`,
            );
          }

          let company = null;
          if (associatedCompany?.id) {
            company = await getCompanyById(associatedCompany.id);
            logger.info(`Company ${JSON.stringify(company, null, 2)}`);
          }

          // Build payload
          const payload = buildProspectsPayload(contact, company);
          logger.info(`Prospect Payload:${JSON.stringify(payload, null, 2)}`);

          // Update and Create Prospect
          const prospect = await insertProspectInMomentum(payload, accessToken);
          logger.info(
            ` prospect in Momentum ${JSON.stringify(prospect, null, 2)}`,
          );
          // buit principal payload
          const principalPayload = buildPrincipalPayload(
            contact,
            prospect.insuredDatabaseId,
          );
          logger.info(
            `Principal Payload:${JSON.stringify(principalPayload, null, 2)}`,
          );

          // Insrert Principal
          const principalResponse = await insertPrincipal(
            principalPayload,
            accessToken,
          );
          logger.info(
            `Principal in Momentum ${JSON.stringify(principalResponse, null, 2)}`,
          );

        }
        //-----------------------------------------------------------------------------------------------
        // for customer
        if (lifecycleStage === "customer") {
          logger.info(
            `Processing contact ID${JSON.stringify(contact.id, null, 2)} | Stage: ${lifecycleStage}`,
          );

          // search associated company
          const associatedCompany = await getAssociatedCompanyByContactId(
            contact?.id,
          );

          logger.info(
            `Associated Company ${JSON.stringify(associatedCompany, null, 2)}`,
          );
          if (!associatedCompany) {
            logger.info(
              `No associated company found for contact ID:${contact.id}`,
            );
          }

          let company = null;
          if (associatedCompany?.id) {
            company = await getCompanyById(associatedCompany.id);
            logger.info(`Company ${JSON.stringify(company, null, 2)}`);
          }

          // build payload for customer

          const payload = buildMomentumContactPayload(contact, company);
          logger.info(` Insured Payload:${JSON.stringify(payload, null, 2)}`);

          // Create and Update Customer
          const insured = await insertProspectInMomentum(payload, accessToken);
          logger.info(
            ` Insured in Momentum ${JSON.stringify(insured, null, 2)}`,
          );

          // buit principal payload
          const principalPayload = buildPrincipalPayload(
            contact,
            insured.insuredDatabaseId,
            
          );
          logger.info(
            `Principal Payload:${JSON.stringify(principalPayload, null, 2)}`,
          );

          // Insrert Principal
          const principalResponse = await insertPrincipal( principalPayload, accessToken,
          );
          logger.info(
            `Principal in Momentum ${JSON.stringify(principalResponse, null, 2)}`,
          );

        }
      } catch (error) {
        console.error(`Error syncing Contact ID ${contact}:`, error);
      }
    }
    logger.info(" ☘️ All Prospect synced successfully.");
  } catch (error) {
    logger.error(`❌ Error fetching customers:`, error);
  }
}

export { syncProspectContact };
