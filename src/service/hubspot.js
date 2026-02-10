import "dotenv/config";
import axios from "axios";
import { logger } from "../index.js";

// Use ONE TOKEN everywhere

// Common axios instance
const hubspot = axios.create({
  baseURL: "https://api.hubapi.com/crm/v3/objects/",
  headers: {
    Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,

    "Content-Type": "application/json",
  },
});

// ---------------------
// GET CONTACTS
// ----------------------
// async function getHubspotContacts(limit = 100) {
//   let contacts = [];
//   let after = undefined;

//   try {
//     while (true) {
//       const params = {
//         limit,
//         properties: ["firstname", "lastname", "email","address","phone","city","state","zip"],
//         ...(after && { after }),
//       };

//       const response = await hubspot.get("contacts", { params });
//       const data = response.data;

//       contacts.push(...data.results);

//       logger.info(`Fetched ${data.results.length} contacts`);

//       return contacts; 

//       if (data.paging?.next?.after) {
//         after = data.paging.next.after;
//       } else {
//         break;
//       }
//     }

//     logger.info(`Fetched ${contacts.length} HubSpot contacts`);

//     return contacts;
//   } catch (error) {
//     logger.error(
//       "Error fetching HubSpot contacts:",
//       error.response?.data || error.message
//     );
//     return [];
//   }
// }
//-----------------------------------------------------+----------------------------------------------------------
// Add Delta function

// async function getHubspotContacts() {
//   try {
//     // Calculate timestamp 2 hours ago
//     // const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
//     const threeDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();



//     const payload = {
//       filterGroups: [
//         {
//           filters: [
//             {
//               propertyName: "lastmodifieddate",
//               operator: "GT",
//               value: threeDaysAgo
//             }
//           ]
//         }
//       ],
//       properties: ["firstname", "lastname", "email", "address", "phone", "city", "state", "zip"],
//       limit: 100
//     };

//     const response = await hubspot.post("contacts/search", payload);

//     const contacts = response.data.results;

//     logger.info(`Fetched ${contacts.length} contacts updated in last 2 hours`);

//     return contacts;
//   } catch (error) {
//     logger.error("Error fetching delta contacts:", error.response?.data || error.message);
//     return [];
//   }
// }

// Delta and pagination
async function getHubspotContacts() {
  try {
    // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "lastmodifieddate",
              operator: "GT",
              value: twoHoursAgo
            }
          ]
        }
      ],
      properties: ["firstname", "lastname", "email", "address", "phone", "city", "state", "zip"],
      limit: 100
    };

    let allContacts = [];
    let hasMore = true;
    let after = undefined;

    while (hasMore) {
      if (after) payload.after = after;

      const response = await hubspot.post("contacts/search", payload);

      const results = response.data.results || [];
      allContacts.push(...results);
      return allContacts; //todo remove

      console.log(`Fetched ${allContacts.length} contacts so far...`);

      // Check pagination
      if (response.data.paging?.next?.after) {
        after = response.data.paging.next.after;
      } else {
        hasMore = false; // No more pages
      }
    }

    logger.info(`Fetched ${allContacts.length} contacts`);

    return allContacts;
  } catch (error) {
    logger.error("Error fetching delta contacts:", error.response?.data || error.message);
    return [];
  }
}


//-----------------------------------------------------+----------------------------------------------------------


// ---------------------
  //  GET COMPANIES
// ---------------------

async function getHubspotCompanies(limit = 100) {
  let companies = [];
  let after = undefined;

  try {
    while (true) {
      const params = {
        limit,
        properties: [
          "name",
          "domain",
          "industry",
          "city",
          "country",
          "website",
          "phone",
        ],
        ...(after && { after }),
      };
   

      const response = await hubspot.get("companies", { params });
      const data = response.data;

      companies.push(...data.results);
      logger.info(`Fetched ${data.results.length} companies`);    

      if (data.paging?.next?.after) {
        after = data.paging.next.after;
      } else {
        break;
      }
    }

    return companies;
  } catch (error) {
    logger.error(
      "Error fetching HubSpot companies:",
      error.response?.data || error.message
    );
    return [];
  }

}


 // services/momentumContact.service.js


// async function createMomentumCompany(company) {
//   try {
//     const response = await axios.post(
//       "https://api.momentum.io/v1/companies",
//       {
//         name: company.name,
//         email: company.email,
//         phone: company.phone,
//         address1: company.address1,
//         address2: company.address2,
//         city: company.city,
//         state: company.state,
//         zip: company.zip,
//         website: company.website,
//         industry: company.industry
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.MOMENTUM_ACCESS_TOKEN}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     return response.data;

//   } catch (error) {
//     console.error(
//       "Error creating Momentum company:",
//       error.response?.data || error.message
//     );
//     return null;
//   }
// }

// create in company in momentum

async function createCompanyInMomentum(companyData, accessToken) {
  try {

    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      companyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Company created successfully in Momentum");
    return response.data.results;

  } catch (error) {
    console.error(
      "Error creating company in Momentum:",
      error.response?.data || error.message
    );
    throw error;
  }
}






// create company in hubspot  


async function createHubspotCompany(company) {
  try {
    const url = "https://api.hubapi.com/crm/v3/objects/companies";

    const payload = {
      properties: {
        name: company.commercialName,       
        phone: company.phone || company.cellPhone || company.smsPhone || null,
        address: company.addressLine1,
        city: company.city,
        state: company.state, // change from stateNameOrAbbreviation to state
        zip: company.zipCode,
        sourceid: company.id,   // change from datbasedid to id
        // email: company.eMail,    //new
        // id: company.insuredId    //new
      }
    };

    // console.log("Payload to HubSpot:", payload);

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    console.log("Company created in HubSpot:", response.data);
    return response.data;

  } catch (error) {
    console.error(
      "Error creating company in HubSpot:",
      error.response?.data || error.message
    );
    return null;
  }
}



//  async function searchCompanyBySourceId(sourceId) {
//   try {
//     const url = "https://api.hubapi.com/crm/v3/objects/companies/search";

//     const payload = {
//       filterGroups: [
//         {
//           filters: [
//             {
//               propertyName: "sourceid",
//               operator: "EQ",
//               value: sourceId
//             }
//           ]
//         }
//       ],
//       properties: ["name", "sourceid", "domain", "createdate"],
//       limit: 1
//     };

//     const response = await axios.post(url, payload, {
//       headers: {
//         Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//         "Content-Type": "application/json"
//       }
//     });

//     console.log("HubSpot company search result:", response.data);
//     return response.data.results[0];

//   } catch (error) {
//     console.error(
//       "Error searching company by sourceId:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }

// getAssociatedCompanies


async function searchCompanyBySourceId(sourceId, name) {
  try {
    const url = "https://api.hubapi.com/crm/v3/objects/companies/search";

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "sourceid",
              operator: "EQ",
              value: sourceId
            },
            {
              propertyName: "name",
              operator: "EQ",
              value: name
            }
          ]
        }
      ],
      properties: ["name", "sourceid", "domain", "createdate"],
      limit: 1
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    // console.log("HubSpot company search result:", response.data);
    return response.data.results[0] || null;

  } catch (error) {
    console.error(
      "Error searching company by sourceId and name:",
      error.response?.data || error.message
    );
    return null;
  }
}

 async function getAssociatedCompanies(contactIds) {
  const url = "https://api.hubapi.com/crm/v4/associations/contacts/companies/batch/read";

  const payload = {
    inputs: contactIds.map(id => ({ id }))
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return response.data; // return association results
  } catch (error) {
    console.error("Error fetching associated companies:", error.response?.data || error.message);
    throw error;
  }
}

// contact to company in hubspot

// const hubspotClient = new hubspot.Client({
//   accessToken: process.env.HUBSPOT_API_ACCESS_TOKEN,
// });

// // Associate Contact ↔ Company
// async function associateContactToCompany(contactId, companyId) {
//   try {
//     const response = await hubspotClient.crm.companies.associationsApi.create(
//       companyId,
//       "contacts",
//       contactId,
//       "company_to_contact"         // association type
//     );

//     console.log("Association created:", response);
//     return response;

//   } catch (err) {
//     console.error("Error associating contact with company:", err.response?.body || err.message);
//     throw err;
//   }
// }
 

   // create contact to hubspot
async function createHubspotContact(contactData,contactid) {
  try {
    const payload = {
      properties: {
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        email: contactData.businessEMail,
        phone: contactData.homePhone,
        // address: contactData.address,
        // city: contactData.city,
        // state: contactData.state,
        // zip: contactData.zip,
        sourceid: contactData.databaseId
      }
    };

    // console.log("Payload to HubSpot:", contactData);

    console.log("Creating HubSpot Contact payload:", payload);
    // console.log("TOKEN CHECK:", process.env.HUBSPOT_API_ACCESS_TOKEN); // debug

    // return;

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    // console.log("HubSpot Contact created successfully:", response.data);

    return response.data;

  } catch (error) {
    console.error("❌ HubSpot Create Contact Error:", error.response?.data || error);
    return null;
  }
}


// search contact to hubspot

async function associateCompanyToContact(companyId, contactId) {
  const url = "https://api.hubapi.com/crm/v3/associations/contacts/companies/batch/create";

  const payload = {
    inputs: [
      {
        from: { id: contactId },
        to: { id: companyId },
        type: "contact_to_company"
      }
    ]
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}


// search contact by sourceid
async function searchContactBySourceId(sourceId) {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "sourceId",   // your custom property name
                operator: "EQ",
                value: sourceId
              }
            ]
          }
        ],
        properties: ["firstname", "lastname", "email", "phone", "sourceId"],
        limit: 1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.total === 0) {
      console.log("No contact found for sourceId:", sourceId);
      return null;
    }

    console.log("Found Contact:", response.data.results[0]);
    return response.data.results[0];

  } catch (error) {
    console.error("❌ Error searching HubSpot contact:", error.response?.data || error);
    return null;
  }
}

// Get All Hubspot company 
   async function getAllHubspotCompanies() {
  try {
    let allCompanies = [];
    let after = undefined;

    while (true) {
      const url = after
        ? `https://api.hubapi.com/crm/v3/objects/companies?limit=100&after=${after}`
        : `https://api.hubapi.com/crm/v3/objects/companies?limit=100`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
        },
      });

      allCompanies = allCompanies.concat(response.data.results);
      
      return allCompanies;
      
      
      // pagination check
      if (!response.data.paging || !response.data.paging.next) break;

      after = response.data.paging.next.after;
    }

    return allCompanies;

  } catch (err) {
    console.error("❌ HubSpot Get All Companies Error:", err.response?.data || err);
    return [];
  }
}

   // search contact by email
// async function searchContactByEmail(email) {
//   try {
//     const payload = {
//       filterGroups: [
//         {
//           filters: [
//             {
//               propertyName: "email",
//               operator: "EQ",
//               value: email,
//             }
//           ]
//         }
//       ],
//       properties: [
//         "firstname",
//         "lastname",
//         "email",
//         "phone",
//         "city",
//         "state",
//         "address",
//         "zip"
//       ],
//       limit: 1
//     };

//     const response = await hubspot.post(
//       "crm/v3/objects/contacts/search",
//       payload
//     );

//     const results = response.data.results;

//     if (results.length === 0) {
//       logger.info(`No contact found for email: ${email}`);
//       return {};
//     }

//     logger.info(`Contact found for email ${email}: ${results[0].id}`);
//     return results[0];  // return contact object

//   } catch (error) {
//     logger.error(
//       "Error searching contact by email:",
//       error.response?.data || error.message
//     );
//     return {};
//   }
// }

async function searchContactByEmail(email) {

  if (!email) {
    console.log ("No email provided");
    return null;
  }
  try {
    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            }
          ]
        }
      ],
      properties: [
        "firstname",
        "lastname",
        "email",
        "phone",
        "city",
        "state",
        "address",
        "zip"
      ],
      limit: 1
    };

    // FIXED ENDPOINT
    const response = await hubspot.post(
      "contacts/search",
      payload
    );

    const results = response.data.results;

    if (results.length === 0) {
      logger.info(`No contact found for email: ${email}`);
      return null;
    }

    logger.info(`Contact found for email ${email}: ${results[0].id}`);
    return results[0];

  } catch (error) {
    logger.error(
      "Error searching contact by email:",
      error.response?.data || error.message
    );
    return null;
  }
}

// update contact in hubspot based in contactid
async function updateHubspotContact(contactData, contactId) {
  if (!contactId || !contactData) {
    console.log("No contact ID provided");
    return null;
  }
  try {
    const payload = {
      properties: {
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        email: contactData.businessEMail,
        phone: contactData.homePhone,
        // address: contactData.address,
        // city: contactData.city,
        // state: contactData.state,
        // zip: contactData.zip,
        sourceid: contactData.databaseId
      }
    };

    console.log("Updating HubSpot Contact payload:", payload);
    console.log("Updating contact ID:", contactId);

    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✔ HubSpot contact updated successfully");
    return response?.data;

  } catch (error) {
    console.error(
      "❌ HubSpot Update Contact Error:",
      error.response?.data || error.message
    );
    return null;
  }
}




// Synced Get All Contacts from Hubspot


async function getAllContacts() {
  try {
    let contacts = [];
    let after = undefined;  // for pagination

    do {
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/contacts`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          params: {
            limit: 100,  // max 100 per page
            after: after,
            properties: "email,firstname,lastname,phone", // specify desired properties
          },
        }
      );

      const data = response.data;
      contacts = contacts.concat(data.results);
      return contacts; // todo remove after testing
      console.log("Contacts:", contacts.length);

      after = data.paging?.next?.after;

      // return contacts; // ✅ ALWAYS return array
    } while (after);

    return contacts;
  } catch (error) {
    console.error("Error fetching contacts from HubSpot:", error.response?.data || error.message);
    return null;
  }
}


// Synced  Get All company from Hubspot

async function getAllCompanies() {
  try {
    let companies = [];
    let after = undefined;

    do {
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/companies`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          params: {
            limit: 100,      // Max 100 per page
            after: after,    // Cursor for pagination
            properties: "name,domain,industry,phone,address,sync_to_momentum", // Specify properties to retrieve
          },
        }
      );

      const data = response.data;
      companies = companies.concat(data.results);
      return companies; // todo remove after testing

      after = data.paging?.next?.after;
        return companies; // ✅ ALWAYS return array
    } while (after);

    return companies;
  } catch (error) {
    console.error("Error fetching companies from HubSpot:", error.response?.data || error.message);
    return null;
  }
}

// search Comapny by name in hubspot

async function searchCompanyByName(companyName) {
  if (!companyName) return [];

  const payload = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "name",
            operator: "EQ",
            value: companyName,
          },
        ],
      },
    ],
    limit: 10,
  };

  try {
    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/companies/search`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error(
      "❌ Error searching company by name:",
      error.response?.data || error.message
    );
    return [];
  }
}


// company create function in hubspot

async function createCompanyInHubSpot(properties) {
  if (!properties || Object.keys(properties).length === 0) {
    console.error("❌ No properties provided for company creation");
  }

  const payload = {
    properties,
  };

  try {
    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/companies`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating company:",
      error.response?.data || error.message
    );
    return {};
  }
}
// Update company in hubspot

async function updateCompanyInHubSpot(companyId, properties) {
  if (!companyId) throw new Error("Company ID is required");
  if (!properties || Object.keys(properties).length === 0) {
    throw new Error("Update properties are required");
  }

  const payload = {
    properties,
  };

  try {
    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating company:",
      error.response?.data || error.message
    );
    return {};
  }
}

// search contacts in momentum

// async function createContactInMomentum(searchPayload) {
//   if (!searchPayload) return null;
//   try {
//     const response = await axios.post(
//       "https://api.nowcerts.com/api/Contact/Search",
//       searchPayload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//         },
//       }
//     );

//     console.log("Contact search successful in Momentum");
//     return response.data.results || response.data;

//   } catch (error) {
//     console.error(
//       "Error searching contact in Momentum:",
//       error.response?.data || error.message
//     );
//     return null;
//   }
// }

//

async function createContactInMomentum(searchPayload, accessToken) {
  if (!searchPayload) return null;

  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      searchPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log("✅ Contact search successful in Momentum");

    // NowCerts may return array or object
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }

    if (response.data?.results?.length > 0) {
      return response.data.results[0];
    }

    return response.data;

  } catch (error) {
    console.error(
      "❌ Error searching contact in Momentum:",
      error.response?.data || error.message
    );
    return null;
  }
}



async function getAssociatedCompanyByContactId(contactId) {
  if (!contactId) return null;

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/companies`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    // If company exists, return first (primary) one
    if (response.data?.results?.length > 0) {
      return response.data.results[0]; // { id, type }
    }

    return null; // No associated company
  } catch (error) {
    console.error(
      "❌ Error fetching associated company:",
      error?.response?.data || error.message
    );
    return null;
  }
}

// Seach Deal in Husbpot


// async function getAllHubSpotDeals() {
//   const limit = 100;
//   let after = null;
//   let hasMore = true;

//   let allDeals = [];

//   try {
//     while (hasMore) {
//       const response = await axios.post(
//         'https://api.hubapi.com/crm/v3/objects/deals/search',
//         {
//           limit,
//           after
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       const deals = response.data.results || [];

//       console.log(
//         `Fetched batch → ${deals.length} deals`
//       );

//       // Add to master array
//       allDeals.push(...deals);
//       // return allDeals; // todo remove after testing

//       // Pagination check
//       if (response.data.paging?.next?.after) {
//         after = response.data.paging.next.after;
//       } else {
//         hasMore = false;
//       }
//     }

//     return allDeals;

//   } catch (error) {
//     console.error(
//       'Error fetching HubSpot deals:',
//       error.response ? error.response.data : error.message
//     );
//     return [];
//   }
// }
// search deal by object id
async function getAllHubSpotDeals() {
  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/deals/search',
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hs_object_id",
                operator: "EQ",
                value: "54744580986"
              }
            ]
          }
        ],
        limit: 1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.results;
  } catch (error) {
    console.error(
      'Error searching deal by object id:',
      error.response?.data || error.message
    );
    return [];
  }
}


// async function getAllHubSpotDeals() {
//   try {
//     const response = await axios.post(
//       'https://api.hubapi.com/crm/v3/objects/deals/search',
//       {
//         filterGroups: [
//           {
//             filters: [
//               {
//                 propertyName: "hs_object_id",
//                 operator: "EQ",
//                 value: "54744580986"
//               }
//             ]
//           }
//         ],
//         properties: [
//           "dealname",
//           "amount",
//           "dealstage",
//           "closedate",
//           "pipeline",
//           "createdate",
//           "firstname",
//           "lastname",
//           "email",
//           "address",
//           "city",
//           "state",
//           "zip"

//         ],
//         limit: 1
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     return response.data.results;
//   } catch (error) {
//     console.error(
//       'Error searching deal by object id:',
//       error.response?.data || error.message
//     );
//     return [];
//   }
// }










// get associated contacts by deal id

async function getAssociatedContactsByDealId(dealId) {
  if (!dealId) return [];

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // returns [{ id, type }]
    return response.data?.results [0] || [];
  } catch (error) {
    console.error(
      "❌ Error fetching associated contacts:",
      error?.response?.data || error.message
    );
    return [];
  }
}




export { getHubspotContacts, getHubspotCompanies,createCompanyInMomentum,createHubspotCompany,associateCompanyToContact
, getAssociatedCompanies,searchCompanyBySourceId,createHubspotContact,searchContactBySourceId,
getAllHubspotCompanies,searchContactByEmail,updateHubspotContact,getAllContacts,getAllCompanies,
searchCompanyByName,createCompanyInHubSpot,updateCompanyInHubSpot,createContactInMomentum,
getAssociatedCompanyByContactId,getAllHubSpotDeals,getAssociatedContactsByDealId};
