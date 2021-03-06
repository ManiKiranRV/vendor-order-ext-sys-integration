import type { Sequelize } from "sequelize";
import { Address as _Address } from "./Address";
import type { AddressAttributes, AddressCreationAttributes } from "./Address";
import { AppUsers as _AppUsers } from "./AppUsers";
import type { AppUsersAttributes, AppUsersCreationAttributes } from "./AppUsers";
import { Documents as _Documents } from "./Documents";
import type { DocumentsAttributes, DocumentsCreationAttributes } from "./Documents";
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
import { VendorBooking as _VendorBooking } from "./VendorBooking";
import type { VendorBookingAttributes, VendorBookingCreationAttributes } from "./VendorBooking";

export {
  _Address as Address,
  _AppUsers as AppUsers,
  _Documents as Documents,
  _ExpResponseData as ExpResponseData,
  _ExpTmsData as ExpTmsData,
  _InvoiceDetails as InvoiceDetails,
  _LineItems as LineItems,
  _OrganisationContact as OrganisationContact,
  _Packages as Packages,
  _VendorBooking as VendorBooking,
};

export type {
  AddressAttributes,
  AddressCreationAttributes,
  AppUsersAttributes,
  AppUsersCreationAttributes,
  DocumentsAttributes,
  DocumentsCreationAttributes,
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
  VendorBookingAttributes,
  VendorBookingCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Address = _Address.initModel(sequelize);
  const AppUsers = _AppUsers.initModel(sequelize);
  const Documents = _Documents.initModel(sequelize);
  const ExpResponseData = _ExpResponseData.initModel(sequelize);
  const ExpTmsData = _ExpTmsData.initModel(sequelize);
  const InvoiceDetails = _InvoiceDetails.initModel(sequelize);
  const LineItems = _LineItems.initModel(sequelize);
  const OrganisationContact = _OrganisationContact.initModel(sequelize);
  const Packages = _Packages.initModel(sequelize);
  const VendorBooking = _VendorBooking.initModel(sequelize);


  return {
    Address: Address,
    AppUsers: AppUsers,
    Documents: Documents,
    ExpResponseData: ExpResponseData,
    ExpTmsData: ExpTmsData,
    InvoiceDetails: InvoiceDetails,
    LineItems: LineItems,
    OrganisationContact: OrganisationContact,
    Packages: Packages,
    VendorBooking: VendorBooking,
  };
}
