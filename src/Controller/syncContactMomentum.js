import { logger, getAllContacts } from "../index.js";
import { buildMomentumContactPayload } from "../utils/helper.js";
import { getContactsModifiedLast1Hour } from "../service/momentum.service.js";
import { getAccessToken } from "../service/momentum.service.js";
import { createContactInMomentum } from "../service/hubspot.js";
import { searchContractBySourceId } from "../service/momentum.service.js";
import { getAssociatedCompanyByContactId } from "../service/hubspot.js";
import { updateContactById } from "../service/momentum.service.js";
import { getCompanyById } from "../service/momentum.service.js";
import{fetchContactsWithSourceGroup}from "../service/momentum.service.js"
import{insertInsuredContact}from "../service/momentum.service.js"

// sync contacts in momentum

async function syncContactMomentum() {
  try {
    // call the function

    // const contacts = await getAllContacts();
    // logger.info("final Contacts:", contacts.length);
    // logger.info("final Contacts:", contacts[0]);
    // return;

    // call the Token
    const accessToken = await getAccessToken();

    // caal the function for all contacts by syc_to_momentum
    //  const contacts = await getContactsModifiedLast1Hour();
    // logger.info("final Contacts:", contacts.length);
    //  logger.info (`Contact ${JSON.stringify(contacts[0], null,2 )}`)
    //  return; //todo remove after testing

    // call the function for all contacts by sourceGroup
    const contacts = await fetchContactsWithSourceGroup();
    logger.info(`final Contacts:${JSON.stringify(contacts.length) }`);
    logger.info (`Contact ${JSON.stringify(contacts[0], null,2 )}`)
    // return;//todo remove after testing

    for (const contact of contacts) {
      try {
      
        
        // logger.info(`Contact ${JSON.stringify(contact, null,2 )}`);
        
        // search associated company
        const associatedCompany = await getAssociatedCompanyByContactId(
          contact?.id
        );
      
        logger.info(`Associated Company ${JSON.stringify(associatedCompany, null,2 )}`)
        if (!associatedCompany) {
          logger.info(`No associated company found for contact ID:${contact.id}`);
        }
       
        
        
        let company = null;
        if (associatedCompany?.id) {
          company = await getCompanyById(associatedCompany.id);
          logger.info(`Company ${JSON.stringify(company, null,2 )}`);
        }
        logger.info("Contact:", contact);
        const contactPayload = buildMomentumContactPayload(contact, company);
        logger.info(` Contact Payload ${JSON.stringify(contactPayload,null,2)}`);

        // return; //todo remove after testing
        // ✅ Create Contact in Momentum
        let contactMomentum = null;
         contactMomentum = await createContactInMomentum(contactPayload,accessToken);
         logger.info(`Contact created in Momentum ${JSON.stringify(contactMomentum, null,2 )}`);

         // ✅ Update Function in Momentum
         let updatedContact= null;
         updatedContact = await updateContactById(contact.id, contactMomentum);
        logger.info(`Contact updated successfully ${JSON.stringify(updatedContact, null,2 )}`);




        return; // todo remove after testing
      } catch (error) {
        logger.error(`Error syncing HubSpot to Momentum:`, error);
      }
    }
    logger.info(" ☘️ All contacts synced successfully.");
  } catch (error) {
    logger.error(`Error syncing HubSpot to Momentum:`, error);
    return;
  }
}

export { syncContactMomentum };
