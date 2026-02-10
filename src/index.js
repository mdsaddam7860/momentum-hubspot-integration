
// import "dotenv/config";

import { app } from "./app.js"; 
import {cleanProps} from "./utils/helper.js"


import{logger}from "./utils/logger.js"

import { getHubspotContacts, getHubspotCompanies, createHubspotCompany, createCompanyInMomentum, 
    associateCompanyToContact, searchCompanyBySourceId, getAssociatedCompanies,updateHubspotContact,getAllHubSpotDeals,getAssociatedContactsByDealId} from "./service/hubspot.js";

import { 
  getAccessToken,
  insertInsuredInMomentum,
  fetchMomentumCustomers,
  getMomentumInsuredContacts,
  // createCompanyInMomentum,
  PutCompanyInMomentum,
  fetchAllCustomerToMomentum,
  insertNowCertsCompany,
  insertNowCertsContacts,
  fetchContactsWithSourceGroup,
  insertInsuredContact,
  searchLifestageContacts,
  SearchProspectsMomentum,
  insertProspectInMomentum,
  insertPrincipal,
  getContactById,
  SearchdatabaseIdInMomentum,
  insertQuoteInMomentum,
} from "./service/momentum.service.js";

import { hubspotToMomentumsync } from "./Controller/hubspotToMomentum.js";
import{createHubspotContact}from "./service/hubspot.js"
import{searchContactBySourceId}from "./service/hubspot.js"
import{getAllHubspotCompanies}from "./service/hubspot.js"
import{searchContactByEmail}from "./service/hubspot.js"
import{getAllCompanies}from "./service/hubspot.js"
import{getAllContacts}from "./service/hubspot.js"
import{searchContractBySourceId}from "./service/momentum.service.js"
import{updateContactById}from "./service/momentum.service.js"
import{getCompanyById}from "./service/momentum.service.js"
 //-----------------------------------+------------------------------------------//
export { 
  app,
  logger,
  cleanProps,

  createHubspotCompany,
  fetchMomentumCustomers,
  getHubspotContacts,
  getHubspotCompanies,
  createCompanyInMomentum,
  hubspotToMomentumsync,
  getAccessToken,
  insertInsuredInMomentum,
  associateCompanyToContact,
  searchCompanyBySourceId,
  getAssociatedCompanies,
  getMomentumInsuredContacts,
  createHubspotContact,
  searchContactBySourceId,
  getAllHubspotCompanies,
  PutCompanyInMomentum,
  searchContactByEmail,
  updateHubspotContact,
  fetchAllCustomerToMomentum,
  getAllCompanies,
  getAllContacts,
  insertNowCertsCompany,
  insertNowCertsContacts,
  searchContractBySourceId,
  updateContactById,
  getCompanyById,
  fetchContactsWithSourceGroup,
  insertInsuredContact,
  searchLifestageContacts,
  SearchProspectsMomentum,
  insertProspectInMomentum,
  getAllHubSpotDeals,
  insertPrincipal,
  getAssociatedContactsByDealId,
  getContactById,
  SearchdatabaseIdInMomentum,
  insertQuoteInMomentum,


};
