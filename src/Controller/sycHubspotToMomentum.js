import { logger, getAllCompanies, getAllContacts } from "../index.js";
import { buildMomentumCompanyPayload } from "../utils/helper.js";
import { insertNowCertsCompany } from "../service/momentum.service.js";
import { insertNowCertsContacts } from "../service/momentum.service.js";
import { searchCompanyByName } from "../service/hubspot.js";
import { createCompanyInHubSpot } from "../service/hubspot.js";
import { updateCompanyInHubSpot } from "../service/hubspot.js";
import { createCompanyInMomentum } from "../service/hubspot.js";
import { getAccessToken } from "../service/momentum.service.js";
import { getCompaniesModifiedLast1Hour } from "../service/momentum.service.js";

async function syncHubspotToMomentum() {
  try {
    // call the function
    // const companies = await getAllCompanies();

    // console.log("final Companies:", companies.length);
    //    return;
    // call the Token
    const accessToken = await getAccessToken();
    // console.log("Access Token:", accessToken);

    // caal the function
    const companies = await getCompaniesModifiedLast1Hour();
    console.log("final companies:", companies.length);
    //  return; //todo remove after testing

    for (const company of companies) {
      try {
        if (
          company.properties?.sync_to_momentum === "No" ||
          company.properties?.sync_to_momentum === null ||
          company.properties?.sync_to_momentum === undefined
        ) {
          console.log("Sync To momentum is no for company ", company);
          continue;
        }

        let companyMomentum = null;
        
        console.log("Company:", company);
        const companyPayload = buildMomentumCompanyPayload(company);
        console.log(" Company Payload", companyPayload);
        
        // ✅ Create company in Momentum
        companyMomentum = await createCompanyInMomentum(
          companyPayload,
          accessToken
        );
        console.log("➕ Company created in Momentum:", companyMomentum.id);

        return;
      } catch (error) {
        console.error("Error syncing HubSpot to Momentum:", error);
      }
    }
  } catch (error) {
    console.error("Error syncing HubSpot to Momentum:", error);
    return;
  }
}

// new code for company sync

// async function syncHubspotToMomentum() {
//   try {
//     // 1️⃣ Get all companies from HubSpot
//     const companies = await getAllCompanies();
//     console.log("Final Companies Count:", companies.length);

//     for (const company of companies) {
//       try {
//         console.log("🔹 HubSpot Company:", company);

//         // 2️⃣ Build payload for Momentum / HubSpot
//         const companyPayload = buildMomentumCompanyPayload(company);
//         console.log("🔹 Company Payload:", companyPayload);

//         // if (!companyPayload?.name) {
//         //   console.warn("⚠️ Company name missing, skipping...");
//         //   continue;
//         // }
//           console.log("Company:", company);
//         console.log("Payload:", companyPayload);

//         // 3️⃣ Search company by name in HubSpot
//         const existingCompanies = await searchCompanyByName(
//           companyPayload.name
//         );

//         // 4️⃣ Update if exists
//         if (existingCompanies.length > 0) {
//           const companyId = existingCompanies[0].id;
//           console.log(`🔄 Updating Company ID: ${companyId}`);

//           await updateCompanyInHubSpot(companyId, companyPayload);
//           console.log("✅ Company updated successfully");
//         }
//         // 5️⃣ Create if not exists
//         else {
//           console.log("➕ Creating new company");

//           await createCompanyInHubSpot(companyPayload);
//           console.log("✅ Company created successfully");
//         }
//          break; // todo remove after testing

//       } catch (error) {
//         console.error(
//           "❌ Error syncing company:",
//           error.response?.data || error.message);
//           break; // todo remove after testing
//       }
//     }
//     console.log("✅ Company sync completed");
//   } catch (error) {
//     console.error(
//       "❌ Error syncing HubSpot to Momentum:",
//       error.response?.data || error.message);
//     return;
//   }
// }

export { syncHubspotToMomentum };
