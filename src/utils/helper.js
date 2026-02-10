function cleanProps(obj) {
  const cleaned = {};

  for (const key in obj) {
    const value = obj[key];

    // Skip undefined
    if (value === undefined) continue;

    // Allow null (HubSpot accepts null for some fields)
    if (value === null) {
      cleaned[key] = null;
      continue;
    }

    // Allow strings and numbers directly
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      cleaned[key] = value;
      continue;
    }

    // If it's an object and has `.toString()`
    if (typeof value === "object") {
      // Capsule rich text: { content: "xxx" }
      if (value.content && typeof value.content === "string") {
        cleaned[key] = value.content;
        continue;
      }

      // Date object → convert to timestamp
      if (value instanceof Date) {
        cleaned[key] = value.getTime();
        continue;
      }

      // Otherwise fallback → JSON string
      cleaned[key] = JSON.stringify(value);
      continue;
    }

    // Everything else → convert to string
    cleaned[key] = String(value);
  }

  return cleaned;
}

function buildMomentumCompanyPayload(hubspotCompany) {
  const data = hubspotCompany.properties || {};

  return {
    commercialName: data.name || null,
    Email: data.email || null, // must be custom property in HubSpot
    Phone: data.phone || null,
    Address1: data.address || null,
    City: data.city || null,
    State: data.state || null,
    Zip: data.zip || null,
  };
}

const audienceTypeMap = {
  "Current Policyholder": "CURRENT_POLICYHOLDER",
  "Looking for a Quote": "LOOKING_FOR_A_QUOTE",
  "Builder/Lender/Developer": "BUILDER_LENDER_DEVELOPER",
  Homeowner: "HOMEOWNER",
  "Information Only": "INFORMATION_ONLY",
};

const projectStateMap = {
  alabama: "ALABAMA",
  alaska: "ALASKA",
  arizona: "ARIZONA",
  arkansas: "ARKANSAS",
  california: "CALIFORNIA",
  colorado: "COLORADO",
  connecticut: "CONNECTICUT",
  delaware: "DELAWARE",
  florida: "FLORIDA",
  georgia: "GEORGIA",
  hawaii: "HAWAII",
  idaho: "IDAHO",
  illinois: "ILLINOIS",
  indiana: "INDIANA",
  iowa: "IOWA",
  kansas: "KANSAS",
  kentucky: "KENTUCKY",
  louisiana: "LOUISIANA",
  maine: "MAINE",
  maryland: "MARYLAND",
  massachusetts: "MASSACHUSETTS",
  michigan: "MICHIGAN",
  minnesota: "MINNESOTA",
  mississippi: "MISSISSIPPI",
  missouri: "MISSOURI",
  montana: "MONTANA",
  nebraska: "NEBRASKA",
  nevada: "NEVADA",
  newhampshire: "NEW_HAMPSHIRE",
  newjersey: "NEW_JERSEY",
  newmexico: "NEW_MEXICO",
  newyork: "NEW_YORK",
  northcarolina: "NORTH_CAROLINA",
  northdakota: "NORTH_DAKOTA",
  ohio: "OHIO",
  oklahoma: "OKLAHOMA",
  oregon: "OREGON",
  pennsylvania: "PENNSYLVANIA",
  rhodeisland: "RHODE_ISLAND",
  southcarolina: "SOUTH_CAROLINA",
  southdakota: "SOUTH_DAKOTA",
  tennessee: "TENNESSEE",
  texas: "TEXAS",
  utah: "UTAH",
  vermont: "VERMONT",
  virginia: "VIRGINIA",
  washington: "WASHINGTON",
  westvirginia: "WEST_VIRGINIA",
  wisconsin: "WISCONSIN",
  wyoming: "WYOMING",
};

function normalizeProjectState(state) {
  if (!state) return null;

  const map = {
    Alabama: "AL",
    Alaska: "AK",
    California: "CA",
    Texas: "TX",
    AL: "AL",
    AK: "AK",
    CA: "CA",
    TX: "TX",
  };

  const s = state.toString().trim();
  return map[s] || null;
}

// function normalizeProjectState(state) {
//   if (!state || typeof state !== "string") return null;
//   // Lowercase and remove spaces
//   const cleaned = state.toLowerCase().replace(/\s+/g, "");
//   return projectStateMap[cleaned] || null;
// }

// for Contact Payload

function buildMomentumContactPayload(contact, company = {}) {

  const payload = cleanProps({
    insured_type: "Commercial",
    type: 0,

   
    commercialName: company?.properties?.name || null,
    Email: contact?.properties?.email || null,
    Phone: contact?.properties?.phone || null,

    // company details
    addressLine1: company?.properties?.address || null,
    addressLine2: company?.properties?.address2 || null,
    zipCode: company?.properties?.zip || null,
    city: company?.properties?.city || null,
    phone: company?.properties?.phone || null,
    cellPhone: company?.properties?.phone_number_1 || null,
    smsPhone: company?.properties?.second_phone || null,
    description: company?.properties?.description || null,
    website: company?.properties?.website || null,
    fax: company?.properties?.fax || null,
    State : company?.properties?.state || null,
    County: company?.properties?.county || null,
  
  });

  return payload;
}

// function buildMomentumContactPayload(contact, company = {}) {

//   // ✅ STEP 1: state calculate FIRST
//   const rawState = company?.properties?.state;
//   const normalizedState = normalizeProjectState(rawState);

//   const stateCode =
//     normalizedState && normalizedState.length === 2
//       ? normalizedState
//       : "AL"; // fallback MUST be code

//   console.log("Raw state:", rawState);
//   console.log("Normalized state:", normalizedState);
//   console.log("Final state sent:", stateCode);

//   // ✅ STEP 2: payload build
//   const payload = cleanProps({
//     insured_type: "Commercial",
//     type: 0,

//     commercialName: company?.properties?.name || null,
//     Email: contact?.properties?.email || null,
//     Phone: contact?.properties?.phone || null,

//     addressLine1: company?.properties?.address || "Test Address 1",
//     addressLine2: company?.properties?.address2 || "Test Address 2",
//     zipCode: company?.properties?.zip || "12345",
//     city: company?.properties?.city || "Test City",

//     phone: company?.properties?.phone || "123-456-7890",
//     cellPhone: company?.properties?.phone_number_1 || "555-555-5555",
//     smsPhone: company?.properties?.second_phone || "098-765-4321",

//     description: company?.properties?.description || "Test description",
//     website: company?.properties?.website || "https://example.com",
//     fax: company?.properties?.fax || "111-222-3333",

//     // ✅ THIS WAS MISSING
//     stateNameOrAbbreviation: stateCode,
//   });

//   return payload;
// }

function buildProspectsPayload(contact, company) {
  const payload = cleanProps({

    insured_type: "Commercial",
    type: 0,

    // firstName: contact?.properties?.firstname || null,
    // lastName: contact?.properties?.lastname || null,
    commercialName: company?.properties?.name || null,
    addressLine1: contact?.properties?.address || null,
    city: contact?.properties?.city || null,
    zipCode: contact?.properties?.project_zip_code || null,
    eMail: contact?.properties?.email || null,
    phone: contact?.properties?.phone || null,
    cellPhone: contact?.properties?.phone_number_1 || null,
    smsPhone: contact?.properties?.second_phone || null,
    description: contact?.properties?.project_description || null,
    website: contact?.properties?.website || null,
    fax: contact?.properties?.fax || null,

    // }
  });

  return payload;
}

// insert principal payload
function buildPrincipalPayload(contact, insuredDatabaseId) {
  const payload = cleanProps({
    insured_database_id: insuredDatabaseId,
    first_name: contact?.properties?.firstname || null,
    last_name: contact?.properties?.lastname || null,
    personal_email: contact?.properties?.email || null,
    business_email: contact?.properties?.email || null,
    insured_email: contact?.properties?.email || null,


    
  });

  return payload;
}

function buildQuotePayload(contact, deal, databaseId) {
  const payload = cleanProps({
    insured_type: "Commercial",
    type: 0,

    // number: contact?.properties?.number || null,
    number: "QT-100245",

    insured_database_id: databaseId || null,
    insured_first_name: contact?.properties?.firstname || null,
    insured_last_name: contact?.properties?.lastname || null,
    // dealname: deal?.properties?.dealname || null,
    insured_email: contact?.properties?.email || null,
    description: deal?.properties?.description || "Test",
    // billing_type: deal?.properties?.dealtype || "New Business",
    insured_address_line_1: deal?.properties?.address || "Test1",
    // insured_address_line_2: deal?.properties?.address2 || "Test2",
    // insured_city: deal?.properties?.city || "Test City",
    // insured_state: deal?.properties?.state || "CA",
    // insured_zip_code: deal?.properties?.zip || "90001",
    // addressLine1: "test data 1",
    // addressLine2: "test data 2",
  });

  return payload;
}

export {
  buildMomentumCompanyPayload,
  buildMomentumContactPayload,
  cleanProps,
  buildProspectsPayload,
  buildPrincipalPayload,
  buildQuotePayload,
};
