// import axios from "axios";

import axios, { all } from "axios";
import qs from "qs";
import { logger } from "../index.js";

// get access token
async function getAccessToken() {
  try {
    const body = qs.stringify({
      grant_type: "password",
      client_id: "ngAuthApp",
      username: "manik.soi@insidea.com",
      password: "Insidea123",
    });

    const response = await axios.post(
      "https://api.nowcerts.com/api/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // console.log("Token:", response.data.access_token);
    return response.data.access_token;
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message);
    return null;
  }
}

// insert insured to momentum

async function insertInsuredInMomentum(contact, token) {
  try {
    const contactData = contact.properties;
    const payload = {
      FirstName: contactData.firstname,
      LastName: contactData.lastname,
      Email: contactData.email,
      Phone: contactData.phone,
      Address1: contactData.address,
      City: contactData.city,
      State: contactData.state,
      Zip: contactData.zip,
    };

    console.log("contact:", contact);

    console.log("payload", payload);
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ Momentum Error:", error.response?.data || error);
    return null;
  }
}

async function createOpportunityInMomentum(opportunityData, token) {
  try {
    const response = await axios.post(
      "https://api.momentum.io/opportunities", // <-- Replace with real URL
      opportunityData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating Opportunity in Momentum:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Add Delta function Fecth Customers based on date

async function fetchMomentumCustomers(token) {
  try {
    console.log("Fetching momentum customers (Delta)");

    const oneHourAgo =
      new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().split(".")[0] +
      "Z";

    const url =
      "https://api.nowcerts.com/api/InsuredDetailList" +
      "?$count=true" +
      "&$orderby=ChangeDate desc" +
      "&$skip=0" +
      `&$filter=ChangeDate ge ${oneHourAgo}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("NowCerts Customers Fetched:", response.data.value.length);

    return response.data.value;
  } catch (error) {
    console.error(
      "Error fetching customers from NowCerts:",
      error.response?.data || error.message,
    );
    return [];
  }
}

// Add Pagination Logic

// async function fetchMomentumCustomers(token) {
//   try {
//     console.log("Fetching momentum customers (Last 1 Hour Delta)");

//     const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000)
//       .toISOString()
//       .split(".")[0] + "Z";

//     const pageSize = 100; // Adjust as per API max limit if known
//     let skip = 0;
//     let allCustomers = [];
//     let totalCount = null;

//     while (true) {
//       const url =
//         "https://api.nowcerts.com/api/InsuredDetailList" +
//         `?$count=true&$orderby=ChangeDate desc&$skip=${skip}` +
//         `&$top=${pageSize}`
//         +`&$filter=ChangeDate ge ${oneHourAgo}`;

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//         },
//       });

//       const customers = response.data.value || [];
//       totalCount = totalCount ?? response.data["@odata.count"]; // total count from first response
//       allCustomers.push(...customers);
//       // return allCustomers; //todo remove after Testing

//       console.log(`Fetched ${customers.length} customers, total so far: ${allCustomers.length}`);

//       // If fetched all, break
//       if (allCustomers.length >= totalCount || customers.length < pageSize) {
//         break;
//       }

//       skip += pageSize; // next page offset
//     }

//     console.log(`Total customers fetched: ${allCustomers.length}`);
//     return allCustomers;

//   } catch (error) {
//     console.error(
//       "Error fetching customers from NowCerts:",
//       error.response?.data || error.message
//     );
//     return [];
//   }
// }

//Get insured contacts

async function getMomentumInsuredContacts(token, insuredIds) {
  const url = "https://api.nowcerts.com/api/Insured/InsuredContacts";

  const body = {
    insuredDataBaseId: [insuredIds],
  };

  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching insured contacts:",
      error.response?.data || error,
    );
    return null;
  }
}

// put company in momentum

async function PutCompanyInMomentum(companyData) {
  const url = "https://api.nowcerts.com/api/Company/Insert";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
      // Add cookie header only if required by your environment
      // 'Cookie': 'ARRAffinity=your_affinity_cookie; ARRAffinitySameSite=your_affinity_cookie'
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error creating company: ${response.status} ${JSON.stringify(errorData)}`,
    );
  }

  return response.json();
  s;
}

// fetch All momentum customers

// const MOMENTUM_BASE_URL = process.env.MOMENTUM_BASE_URL;

// Helper to generate A-Z
//todo remove
// const getAlphabets = () =>
//   Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
// const numericChars = () =>
//   Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i));

/**
 * Fetch customers from Momentum for names starting with each alphabet A-Z
 * Supports pagination per letter
 */
// async function fetchAllCustomerToMomentum(token) {

//   try {
//     let allCustomers = [];
//     const alphabets = getAlphabets();
//     alphabets.push(...numericChars()); // Add numeric characters 0-9

//     for (const letter of alphabets) {
//       logger.info(`🔎 Fetching customers starting with: ${letter}`);

//       let page = 1;
//       let pageSize = 200;

//       let hasMore = true;

//       while (hasMore) {

//         // const url = `/api/Customers/GetCustomers?Name=${encodeURIComponent(
//     // )}`;
//         const url = `https://api.nowcerts.com/api/Customers/GetCustomers`;

//         const response = await axios.get(url, {
//           params: {
//             Name: letter,     // Filter by starting alphabet
//             Page: page,
//             PageSize: pageSize,
//           },
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         const data = response.data;

//         // some APIs return data.items, some return data
//         const customers = data.items || data || [];

//         // if (customers.length > 0) {
//         //   logger.info(`  Page ${page}: fetched ${customers.length} customers`);
//         // }

//         allCustomers.push(...customers);

//         console.log('allCustomers.length:',allCustomers.length);

//         hasMore = customers.length === pageSize;
//         page++;
//       }
//     }

//     logger.info(`✅ Total customers fetched from A–Z: ${allCustomers.length}`);

//     return allCustomers;

//   } catch (error) {
//     logger.error("❌ Error fetching customers:", error.message);
//     return [];
//   }
// }

/**
 * Fetch ALL customers from Momentum using DatabaseId
 * Uses pure pagination (no A-Z filtering)
 */

// all databae logic

async function fetchAllCustomerToMomentum(token, maxId = 5000) {
  let all = [];

  for (let id = 1; id <= maxId; id++) {
    const url = `https://api.nowcerts.com/api/Customers/GetCustomers?CustomerId=${id}`;
    console.log("Fetching ID:", id);

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        all.push(...res.data);
      }
    } catch (e) {
      console.log("Error on id:", id, e.message);
    }
  }

  const unique = Object.values(
    all.reduce((acc, c) => {
      acc[c.CustomerId] = c;
      return acc;
    }, {}),
  );

  console.log("TOTAL UNIQUE CUSTOMERS:", unique.length);
  return unique;
}

// Insert NowCerts Comapny

async function insertNowCertsCompany(payload) {
  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error inserting insured:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Insert Nowcerts Contacts

async function insertNowCertsContacts(payload) {
  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "NowCerts Insured Insert Error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// search company in momentum from delta

async function getCompaniesModifiedLast1Hour() {
  try {
    // ⏱️ Calculate 1 hour ago (ISO format)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    let companies = [];
    let after;

    do {
      const response = await axios.post(
        "https://api.hubapi.com/crm/v3/objects/companies/search",
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "hs_lastmodifieddate",
                  operator: "GTE",
                  value: oneHourAgo,
                },
                {
                  propertyName: "sync_to_momentum",
                  operator: "EQ",
                  value: "Yes",
                },
              ],
            },
          ],
          properties: [
            "name",
            "domain",
            "phone",
            "sync_to_momentum",
            "hs_lastmodifieddate",
          ],
          limit: 100,
          after,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      companies.push(...response.data.results);
      return companies; // todo after remove testing

      after = response.data.paging?.next?.after;
    } while (after);

    return companies;
  } catch (error) {
    console.error(
      "❌ Error fetching HubSpot companies (last 1 hour):",
      error.response?.data || error.message,
    );
    return [];
  }
}

// search contacts in momentum from delta
async function getContactsModifiedLast1Hour() {
  try {
    // ⏱️ 1 hour ago (UTC, ISO)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    let contacts = [];
    let after;

    do {
      const response = await axios.post(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "sync_to_momentum",
                  operator: "EQ",
                  value: "Yes",
                },
                // {
                //   propertyName: "lastmodifieddate",
                //   operator: "GTE",
                //   value: oneHourAgo,
                // },
              ],
            },
          ],
          properties: [
            "firstname",
            "lastname",
            "email",
            "phone",
            "sync_to_momentum",
            "lastmodifieddate",
            "souceid",
            "address",
            "city",
            "state",
            "zip",
          ],
          limit: 100,
          after,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      contacts.push(...response.data.results);
      return contacts; //todo remove after Testing
      after = response.data.paging?.next?.after;
    } while (after);

    return contacts;
  } catch (error) {
    console.error(
      "❌ Error fetching HubSpot contacts (last 1 hour):",
      error.response?.data || error.message,
    );
    return [];
  }
}

// search contact by sourceid

async function searchContractBySourceId(sourceId) {
  if (!sourceId) return null;

  try {
    const url = "https://api.hubapi.com/crm/v3/objects/contracts/search";

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "sourceid",
              operator: "EQ",
              value: sourceId,
            },
          ],
        },
      ],
      properties: ["sourceid"],
      limit: 10,
      after: 0,
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
      },
    });

    return response.data.results[0] || null;
  } catch (error) {
    console.error(
      "Error searching deal by sourceid:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Update function in contacts

async function updateContactById(contactId, momentum) {
  try {
    if (!contactId || !momentum) {
      // throw new Error("contactId and properties are required");
      console.log("contactId and properties are required");
      return null;
    }
    const payload = {
      properties: {
        sourceid: momentum?.insuredDatabaseId,
      },
    };

    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    // console.log("✅ Contact updated successfully:", response.data.id);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating HubSpot contact:",
      error?.response?.data || error.message,
    );
    return null;
  }
}

// get company by id

// async function getCompanyById(companyId,) {
//   if (!companyId) {
//     console.log("Company ID is required");
//     return Null;
//   }
//   try {
//     if (!companyId) {
//       console.log("Company ID is required");
//       return {};
//     }

//     const response = await axios.get(
//       `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     console.log("✅ Company fetched successfully:", response.data.id);
//     return response.data;

//   } catch (error) {
//     console.error(
//       "❌ Error fetching company:",
//       error?.response?.data || error.message
//     );
//     return null;
//   }
// }

// Add new company Properties
async function getCompanyById(companyId) {
  if (!companyId) {
    console.log("Company ID is required");
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}`,
      {
        params: {
          properties: [
            "city",
            "domain",
            "name",
            "phone",
            "state",
            "zip",
            "buildertrend_id",
            "source_toolbox",
            "firstname",
            "address",
            "lastname",
            "email",
          ].join(","),
        },
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Company fetched successfully:", response.data.id);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching company:",
      error?.response?.data || error.message,
    );
    return null;
  }
}

// fetch All contact with source group

//  Add Pagination Logic
// async function fetchContactsWithSourceGroup() {

//     const allContacts = [];
//     let after = null;
//     const limit = 100;

//     console.log("Fetching contacts from HubSpot (Last 1 Hour Delta)");

//     const oneHourAgo = new Date(Date.now() - 10 * 60 * 1000)
//         .toISOString()
//         .split(".")[0] + "Z";

//     try {
//         do {
//             const requestBody = {
//                 filterGroups: [
//                     {
//                         filters: [
//                             {
//                                 propertyName: "source_group",
//                                 operator: "HAS_PROPERTY"
//                             }
//                         ]
//                     },
//                     {
//                         filters: [
//                             {
//                                 propertyName: "lastmodifieddate",
//                                 operator: "GTE",
//                                 value: oneHourAgo
//                             }
//                         ]
//                     }
//                 ],
//                 properties: [
//                     "firstname",
//                     "lastname",
//                     "email",
//                     "source_group",
//                     "sourceid",
//                     "phone",
//                     "address",
//                     "city",
//                     "state",
//                     "zip",
//                     "lastmodifieddate"
//                 ],
//                 limit,
//                 ...(after && { after })
//             };

//             // console.log("Request body:", JSON.stringify(requestBody, null, 2));

//             const response = await axios.post(
//                 "https://api.hubapi.com/crm/v3/objects/contacts/search",
//                 requestBody,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//                         "Content-Type": "application/json"
//                     }
//                 }
//             );

//             const results = response.data.results || [];
//             allContacts.push(...results);
//             // return allContacts; //todo remove after Testing
//             after = response?.data?.paging?.next?.after || null;

//             console.log(`Fetched ${results.length} contacts, total so far: ${allContacts.length}`);

//         } while (after);

//         console.log(`Total contacts fetched: ${allContacts.length}`);

//         return allContacts;

//     } catch (error) {
//         console.error(
//             "Error fetching HubSpot contacts with delta:",
//             error.response?.data
//         );
//         return allContacts;
//     }
// }

// async function fetchContactsWithSourceGroup() {
//     console.log("Fetching contacts from HubSpot (Delta)");

//     const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;

//     try {
//         const requestBody = {
//             filterGroups: [
//                 {
//                     filters: [
//                         {
//                             propertyName: "source_group",
//                             operator: "HAS_PROPERTY"
//                         },
//                         {
//                             propertyName: "lastmodifieddate",
//                             operator: "GTE",
//                             value: oneHourAgo.toString()
//                         }
//                     ]
//                 }
//             ],
//             properties: [
//                 "firstname",
//                 "lastname",
//                 "email",
//                 "source_group",
//                 "sourceid",
//                 "phone",
//                 "address",
//                 "city",
//                 "state",
//                 "zip",
//                 "lastmodifieddate"
//             ],
//             limit: 100 // HubSpot max per request
//         };

//         const response = await axios.post(
//             "https://api.hubapi.com/crm/v3/objects/contacts/search",
//             requestBody,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         return response.data.results || [];

//     } catch (error) {
//         console.error(
//             "Error fetching HubSpot contacts with delta:",
//             error.response?.data || error.message
//         );
//         return [];
//     }
// }

// Add New Conatact properties

// async function fetchContactsWithSourceGroup() {
//     console.log("Fetching contacts from HubSpot (Delta)");

//     // 1 hour ago (epoch milliseconds)
//     const oneHourAgo = Date.now() - 60 * 60 * 1000;

//     try {
//         const requestBody = {
//             filterGroups: [
//                 {
//                     filters: [
//                         {
//                             propertyName: "source_group",
//                             operator: "HAS_PROPERTY"
//                         },
//                         // {
//                         //     propertyName: "lastmodifieddate",
//                         //     operator: "GTE",
//                         //     value: oneHourAgo.toString()
//                         // }
//                     ]
//                 }
//             ],
//             properties: [
//                 "company",
//                 "email",
//                 "firstname",
//                 "lastname",
//                 "phone",
//                 "audience_type",
//                 "best_time_to_contact",
//                 "coverage_type_interest",
//                 "evari_quote_id",
//                 "file_upload_toolbox",
//                 "form_acknowledgment",
//                 "lead_entry_point",
//                 "mailing_address_city",
//                 "mailing_address_different",
//                 "mailing_address_postal_code",
//                 "mailing_address_state",
//                 "mailing_address_street",
//                 "policy_duration",
//                 "policy_start_date",
//                 "preferred_contact_method",
//                 "product",
//                 "product_interest",
//                 "product_tile_clicked",
//                 "project_address",
//                 "project_address_2",
//                 "project_city",
//                 "project_state",
//                 "project_zip_code",
//                 "project_description",
//                 "project_location",
//                 "request_category",
//                 "routing_metadata_toolbox",
//                 "state_of_operations",
//                 "subproduct",
//                 "tell_us_more_about_your_request",
//                 "tf_url",
//                 "source_group",
//                 "what_best_describes_your_role_",
//                 "lastmodifieddate"
//             ],
//             limit: 100
//         };

//         const response = await axios.post(
//             "https://api.hubapi.com/crm/v3/objects/contacts/search",
//             requestBody,
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         return response.data.results || [];

//     } catch (error) {
//         console.error(
//             "Error fetching HubSpot contacts with source_group delta:",
//             error.response?.data || error.message
//         );
//         return [];
//     }
// }

// add delta Add New Conatact properties

async function fetchContactsWithSourceGroup() {
  console.log("Fetching contacts from HubSpot (Delta + Pagination)");

  const allContacts = [];
  let after = undefined;

  // 🔹 Delta: last 1 hour (epoch milliseconds)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  try {
    do {
      const requestBody = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "source_group",
                operator: "HAS_PROPERTY",
              },
              // {
              //     propertyName: "lastmodifieddate",
              //     operator: "GTE",
              //     value: oneHourAgo.toString()
              // }
            ],
          },
        ],
        properties: [
          "company",
          "email",
          "firstname",
          "lastname",
          "phone",
          "audience_type",
          "best_time_to_contact",
          "coverage_type_interest",
          "evari_quote_id",
          "file_upload_toolbox",
          "form_acknowledgment",
          "lead_entry_point",
          "mailing_address_city",
          "mailing_address_different",
          "mailing_address_postal_code",
          "mailing_address_state",
          "mailing_address_street",
          "policy_duration",
          "policy_start_date",
          "preferred_contact_method",
          "product",
          "product_interest",
          "product_tile_clicked",
          "project_address",
          "project_address_2",
          "project_city",
          "project_state",
          "project_zip_code",
          "project_description",
          "project_location",
          "request_category",
          "routing_metadata_toolbox",
          "state_of_operations",
          "subproduct",
          "tell_us_more_about_your_request",
          "tf_url",
          "source_group",
          "what_best_describes_your_role_",
          "lastmodifieddate",
          "lifecyclestage",
          "hs_lead_status",
        ],
        limit: 100,
        ...(after && { after }),
      };

      const response = await axios.post(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      const results = response.data.results || [];
      allContacts.push(...results);
      return allContacts; // todo remove after testing

      after = response.data.paging?.next?.after;

      console.log(
        `Fetched ${results.length} contacts | Total: ${allContacts.length}`,
      );
    } while (after);

    return allContacts;
  } catch (error) {
    console.error(
      "Error fetching HubSpot contacts (delta + pagination):",
      error.response?.data || error.message,
    );
    return allContacts;
  }
}

// search function in contact based on database id

async function insertInsuredContact(data, accessToken) {
  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Cookie:
            "ARRAffinity=34e9092522d828ce3f68b0fc2d734f9da443874f86beba281a0c943e057a71cc; ARRAffinitySameSite=34e9092522d828ce3f68b0fc2d734f9da443874f86beba281a0c943e057a71cc",
        },
      },
    );

    return response?.data;
  } catch (error) {
    console.error(
      "Error inserting insured record:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Search lifestage contacts

// async function searchLifestageContacts() {
  
//   console.log("Fetching contacts with lifecyclestage");

//   const allContacts = [];
//   let after = undefined;

//   try {
//     do {
//       const requestBody = {
//         filterGroups: [
//           {
//             filters: [
//               {
//                 propertyName: "lifecyclestage",
//                 operator: "HAS_PROPERTY",
//               },
//             ],
//           },
//         ],
//         properties: [
//           "firstname",
//           "lastname",
//           "lifecyclestage",
//           "email",
//           "phone",
//           "phone_number_1",
//           "second_phone",
//           "address",
//           "city",
//           "project_zip_code",
//           "email",
//           "fax",
//           "project_description",
//           "website",

//         ],
//         limit: 200,
//         ...(after && { after }),
//       };

//       const response = await axios.post(
//         "https://api.hubapi.com/crm/v3/objects/contacts/search",
//         requestBody,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const results = response?.data?.results || [];
//       allContacts.push(...results);
//       // return allContacts; // todo remove after Testing

//       after = response?.data?.paging?.next?.after;

//       console.log(
//         `Fetched ${results.length} contacts | Total: ${allContacts.length}`
//       );
      
//     } while (after);

//     return allContacts;
//   } catch (error) {
//     console.error(
//       "Error fetching lifecyclestage contacts:",
//       error.response?.data || error.message
//     );
//     return allContacts;
//   }
// }

// async function searchLifestageContacts() {
//   console.log("Fetching contacts with lifecyclestage");

//   const limit = 200;
//   let after = null;
//   let hasMore = true;

//   const allContacts = [];

//   try {
//     while (hasMore) {
//       const requestBody = {
//         filterGroups: [
//           {
//             filters: [
//               {
//                 propertyName: "hs_object_id",
//                 operator: "EQ",
//                 value: "196244532240",
//               },
//             ],
//           },
//         ],
//         properties: [
//           "firstname",
//           "lastname",
//           "lifecyclestage",
//           "email",
//           "phone",
//           "phone_number_1",
//           "second_phone",
//           "address",
//           "city",
//           "project_zip_code",
//           "fax",
//           "project_description",
//           "website",
//           "commercialName",
//         ],
//         limit,
//         after,
//       };

//       const response = await axios.post(
//         "https://api.hubapi.com/crm/v3/objects/contacts/search",
//         requestBody,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       const results = response?.data?.results || [];
//       allContacts.push(...results);
//       return allContacts; // todo remove after Testing

//       console.log(
//         `Fetched batch → ${results.length} contacts | Total: ${allContacts.length}`,
//       );

//       // Pagination handling
//       if (response.data.paging?.next?.after) {
//         after = response.data.paging.next.after;
//       } else {
//         hasMore = false;
//       }
//     }

//     return allContacts;
//   } catch (error) {
//     console.error(
//       "Error fetching lifecyclestage contacts:",
//       error.response?.data || error.message
//     );
//     return allContacts;
//   }
// }

// add delta function
async function searchLifestageContacts() {
  console.log("Fetching contacts updated in last 30 min");

  const allContacts = [];
  let after = undefined;

  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

  try {
    do {
      const requestBody = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hs_lastmodifieddate",
                operator: "GTE",
                value: thirtyMinutesAgo.toString(),
              },
            ],
          },
        ],
        properties: [
          "firstname",
          "lastname",
          "lifecyclestage",
          "email",
          "phone",
          "phone_number_1",
          "second_phone",
          "address",
          "city",
          "project_zip_code",
          "fax",
          "project_description",
          "website",
          "commercialName",
          
        ],
        limit: 200,
        ...(after && { after }),
      };

      const response = await axios.post(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response?.data?.results || [];
      allContacts.push(...results);

      after = response?.data?.paging?.next?.after;

      console.log(
        `Fetched ${results.length} contacts | Total: ${allContacts.length}`
      );
    } while (after);

    // ✅ filter lifecyclestage safely in code
    return allContacts.filter(
      c => c.properties?.lifecyclestage
    );

  } catch (error) {
    console.error(
      "Error fetching lifecyclestage contacts:",
      error.response?.data || error.message
    );
    return allContacts;
  }
}







// search Prospects in momentum

async function SearchProspectsMomentum(databaseId, accessToken) {
  try {
    const response = await axios.get(
      "https://api.nowcerts.com/api/Customers/GetCustomers",
      {
        params: {
          databaseId,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching NOWCERTS customers:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Update and Create Prospectfunction in Momentum
async function insertProspectInMomentum(payload, accessToken) {
  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Insured/Insert",
      payload,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error inserting insured:",
      error.response?.data || error.message,
    );
    return null;
  }
}


// Insert Principal function in Momentum
async function insertPrincipal(payload,accessToken) {
  try {

    const response = await axios.post(
      "https://api.nowcerts.com/api/Zapier/InsertPrincipal",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error inserting principal:",
      error.response?.data || error.message
    );
    return null;
  }
}

// get conatact by id
async function getContactById(contactId) {
  if (!contactId) {
    console.log("Contact ID is required");
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      {
        params: {
          properties: [
            "firstname",
            "lastname",
            "email",
            "phone",
            "mobilephone",
            "city",
            "state",
            "zip",
            "address",
            "company",
            "jobtitle",
            "lifecyclestage",
            "source_toolbox",
            "buildertrend_id",
          ].join(","),
        },
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Contact fetched successfully:", response.data.id);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching contact:",
      error?.response?.data || error.message
    );
    return null;
  }
}
//

async function SearchdatabaseIdInMomentum(email, accessToken) {
  try {
    const response = await axios.get(
      "https://api.nowcerts.com/api/Customers/GetCustomers",
      {
        params: {
          email,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data [0] || null;
  } catch (error) {
    console.error(
      "Error fetching NOWCERTS customers:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// insert Quote in Momentum

async function insertQuoteInMomentum({ payload, accessToken }) {
  if (!payload) {
   return null;
  }

  try {
    const response = await axios.post(
      "https://api.nowcerts.com/api/Zapier/InsertQuote",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("✅ Quote inserted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error inserting quote:",
      error?.response?.data || error.message
    );
    return null;
  }
}



export {
  getAccessToken,
  insertInsuredInMomentum,
  createOpportunityInMomentum,
  fetchMomentumCustomers,
  getMomentumInsuredContacts,
  PutCompanyInMomentum,
  fetchAllCustomerToMomentum,
  insertNowCertsCompany,
  insertNowCertsContacts,
  getCompaniesModifiedLast1Hour,
  getContactsModifiedLast1Hour,
  searchContractBySourceId,
  updateContactById,
  getCompanyById,
  fetchContactsWithSourceGroup,
  insertInsuredContact,
  searchLifestageContacts,
  SearchProspectsMomentum,
  insertProspectInMomentum,
  insertPrincipal,
  getContactById,
  SearchdatabaseIdInMomentum,
  insertQuoteInMomentum,
};
