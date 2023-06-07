import type { Sequelize } from "sequelize";
import { BvEventsToLobster as _BvEventsToLobster } from "./BvEventsToLobster";
import type { BvEventsToLobsterAttributes, BvEventsToLobsterCreationAttributes } from "./BvEventsToLobster";
import { AccountsMaster as _AccountsMaster } from "./AccountsMaster";
import type { AccountsMasterAttributes, AccountsMasterCreationAttributes } from "./AccountsMaster";
import { Address as _Address } from "./Address";
import type { AddressAttributes, AddressCreationAttributes } from "./Address";
import { AppUsers as _AppUsers } from "./AppUsers";
import type { AppUsersAttributes, AppUsersCreationAttributes } from "./AppUsers";
import { ConfigEventsToLobster as _ConfigEventsToLobster } from "./ConfigEventsToLobster";
import type { ConfigEventsToLobsterAttributes, ConfigEventsToLobsterCreationAttributes } from "./ConfigEventsToLobster";
import { Documents as _Documents } from "./Documents";
import type { DocumentsAttributes, DocumentsCreationAttributes } from "./Documents";
import { Events as _Events } from "./Events";
import type { EventsAttributes, EventsCreationAttributes } from "./Events";
import { EventsStage as _EventsStage } from "./EventsStage";
import type { EventsStageAttributes, EventsStageCreationAttributes } from "./EventsStage";
import { ExpRateBlessData as _ExpRateBlessData } from "./ExpRateBlessData";
import type { ExpRateBlessDataAttributes, ExpRateBlessDataCreationAttributes } from "./ExpRateBlessData";
import { ExpRateResponseData as _ExpRateResponseData } from "./ExpRateResponseData";
import type { ExpRateResponseDataAttributes, ExpRateResponseDataCreationAttributes } from "./ExpRateResponseData";
import { ExpRateTmsData as _ExpRateTmsData } from "./ExpRateTmsData";
import type { ExpRateTmsDataAttributes, ExpRateTmsDataCreationAttributes } from "./ExpRateTmsData";
import { ExpResponseData as _ExpResponseData } from "./ExpResponseData";
import type { ExpResponseDataAttributes, ExpResponseDataCreationAttributes } from "./ExpResponseData";
import { ExpTmsData as _ExpTmsData } from "./ExpTmsData";
import type { ExpTmsDataAttributes, ExpTmsDataCreationAttributes } from "./ExpTmsData";
import { InvoiceDetails as _InvoiceDetails } from "./InvoiceDetails";
import type { InvoiceDetailsAttributes, InvoiceDetailsCreationAttributes } from "./InvoiceDetails";
import { LineItems as _LineItems } from "./LineItems";
import type { LineItemsAttributes, LineItemsCreationAttributes } from "./LineItems";
import { OrganisationContact as _OrganisationContact } from "./OrganisationContact";
import type { OrganisationContactAttributes, OrganisationContactCreationAttributes } from "./OrganisationContact";
import { Packages as _Packages } from "./Packages";
import type { PackagesAttributes, PackagesCreationAttributes } from "./Packages";
import { RegistrationNumbers as _RegistrationNumbers } from "./RegistrationNumbers";
import type { RegistrationNumbersAttributes, RegistrationNumbersCreationAttributes } from "./RegistrationNumbers";
import { Retry as _Retry } from "./Retry";
import type { RetryAttributes, RetryCreationAttributes } from "./Retry";
import { VendorBooking as _VendorBooking } from "./VendorBooking";
import type { VendorBookingAttributes, VendorBookingCreationAttributes } from "./VendorBooking";

export {
  _BvEventsToLobster as BvEventsToLobster,
  _AccountsMaster as AccountsMaster,
  _Address as Address,
  _AppUsers as AppUsers,
  _ConfigEventsToLobster as ConfigEventsToLobster,
  _Documents as Documents,
  _Events as Events,
  _EventsStage as EventsStage,
  _ExpRateBlessData as ExpRateBlessData,
  _ExpRateResponseData as ExpRateResponseData,
  _ExpRateTmsData as ExpRateTmsData,
  _ExpResponseData as ExpResponseData,
  _ExpTmsData as ExpTmsData,
  _InvoiceDetails as InvoiceDetails,
  _LineItems as LineItems,
  _OrganisationContact as OrganisationContact,
  _Packages as Packages,
  _RegistrationNumbers as RegistrationNumbers,
  _Retry as Retry,
  _VendorBooking as VendorBooking,
};

export type {
  BvEventsToLobsterAttributes,
  BvEventsToLobsterCreationAttributes,
  AccountsMasterAttributes,
  AccountsMasterCreationAttributes,
  AddressAttributes,
  AddressCreationAttributes,
  AppUsersAttributes,
  AppUsersCreationAttributes,
  ConfigEventsToLobsterAttributes,
  ConfigEventsToLobsterCreationAttributes,
  DocumentsAttributes,
  DocumentsCreationAttributes,
  EventsAttributes,
  EventsCreationAttributes,
  EventsStageAttributes,
  EventsStageCreationAttributes,
  ExpRateBlessDataAttributes,
  ExpRateBlessDataCreationAttributes,
  ExpRateResponseDataAttributes,
  ExpRateResponseDataCreationAttributes,
  ExpRateTmsDataAttributes,
  ExpRateTmsDataCreationAttributes,
  ExpResponseDataAttributes,
  ExpResponseDataCreationAttributes,
  ExpTmsDataAttributes,
  ExpTmsDataCreationAttributes,
  InvoiceDetailsAttributes,
  InvoiceDetailsCreationAttributes,
  LineItemsAttributes,
  LineItemsCreationAttributes,
  OrganisationContactAttributes,
  OrganisationContactCreationAttributes,
  PackagesAttributes,
  PackagesCreationAttributes,
  RegistrationNumbersAttributes,
  RegistrationNumbersCreationAttributes,
  RetryAttributes,
  RetryCreationAttributes,
  VendorBookingAttributes,
  VendorBookingCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const BvEventsToLobster = _BvEventsToLobster.initModel(sequelize);
  const AccountsMaster = _AccountsMaster.initModel(sequelize);
  const Address = _Address.initModel(sequelize);
  const AppUsers = _AppUsers.initModel(sequelize);
  const ConfigEventsToLobster = _ConfigEventsToLobster.initModel(sequelize);
  const Documents = _Documents.initModel(sequelize);
  const Events = _Events.initModel(sequelize);
  const EventsStage = _EventsStage.initModel(sequelize);
  const ExpRateBlessData = _ExpRateBlessData.initModel(sequelize);
  const ExpRateResponseData = _ExpRateResponseData.initModel(sequelize);
  const ExpRateTmsData = _ExpRateTmsData.initModel(sequelize);
  const ExpResponseData = _ExpResponseData.initModel(sequelize);
  const ExpTmsData = _ExpTmsData.initModel(sequelize);
  const InvoiceDetails = _InvoiceDetails.initModel(sequelize);
  const LineItems = _LineItems.initModel(sequelize);
  const OrganisationContact = _OrganisationContact.initModel(sequelize);
  const Packages = _Packages.initModel(sequelize);
  const RegistrationNumbers = _RegistrationNumbers.initModel(sequelize);
  const Retry = _Retry.initModel(sequelize);
  const VendorBooking = _VendorBooking.initModel(sequelize);


  return {
    BvEventsToLobster: BvEventsToLobster,
    AccountsMaster: AccountsMaster,
    Address: Address,
    AppUsers: AppUsers,
    ConfigEventsToLobster: ConfigEventsToLobster,
    Documents: Documents,
    Events: Events,
    EventsStage: EventsStage,
    ExpRateBlessData: ExpRateBlessData,
    ExpRateResponseData: ExpRateResponseData,
    ExpRateTmsData: ExpRateTmsData,
    ExpResponseData: ExpResponseData,
    ExpTmsData: ExpTmsData,
    InvoiceDetails: InvoiceDetails,
    LineItems: LineItems,
    OrganisationContact: OrganisationContact,
    Packages: Packages,
    RegistrationNumbers: RegistrationNumbers,
    Retry: Retry,
    VendorBooking: VendorBooking,
  };
}
