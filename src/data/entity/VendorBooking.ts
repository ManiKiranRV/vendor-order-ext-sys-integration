import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface VendorBookingAttributes {
  id: number;
  customer_order_number?: string;
  sequence_timestamp?: string;
  planned_shipping_date_and_time?: Date;
  shipment_creation_date_time?: Date;
  order_status?: string;
  shipment_inco_terms?: string;
  commodity_code?: string;
  commodity_text?: string;
  shipment_service_code?: string;
  dangerous_goods?: string;
  content_id?: string;
  uncode?: string;
  consignor_ref?: string;
  hawb?: string;
  response_error_code?: string;
  response_error_title?: string;
  response_error_detail?: string;
  response_time_stamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type VendorBookingPk = "id";
export type VendorBookingId = VendorBooking[VendorBookingPk];
export type VendorBookingOptionalAttributes = "id" | "customer_order_number" | "sequence_timestamp" | "planned_shipping_date_and_time" | "shipment_creation_date_time" | "order_status" | "shipment_inco_terms" | "commodity_code" | "commodity_text" | "shipment_service_code" | "dangerous_goods" | "content_id" | "uncode" | "consignor_ref" | "hawb" | "response_error_code" | "response_error_title" | "response_error_detail" | "response_time_stamp" | "createdAt" | "updatedAt" | "deletedAt";
export type VendorBookingCreationAttributes = Optional<VendorBookingAttributes, VendorBookingOptionalAttributes>;

export class VendorBooking extends Model<VendorBookingAttributes, VendorBookingCreationAttributes> implements VendorBookingAttributes {
  id!: number;
  customer_order_number?: string;
  sequence_timestamp?: string;
  planned_shipping_date_and_time?: Date;
  shipment_creation_date_time?: Date;
  order_status?: string;
  shipment_inco_terms?: string;
  commodity_code?: string;
  commodity_text?: string;
  shipment_service_code?: string;
  dangerous_goods?: string;
  content_id?: string;
  uncode?: string;
  consignor_ref?: string;
  hawb?: string;
  response_error_code?: string;
  response_error_title?: string;
  response_error_detail?: string;
  response_time_stamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof VendorBooking {
    return VendorBooking.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sequence_timestamp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    planned_shipping_date_and_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipment_creation_date_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    order_status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shipment_inco_terms: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    commodity_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    commodity_text: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    shipment_service_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dangerous_goods: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    content_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    uncode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    consignor_ref: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hawb: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    response_error_code: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    response_error_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    response_error_detail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    response_time_stamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vendor_booking',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
