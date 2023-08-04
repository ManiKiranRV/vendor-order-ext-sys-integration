import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpCommercialInvoiceDataAttributes {
  id: number;
  blessMessage?: string;
  tms_req_message?: object;
  shipment_Tracking_Number?: string;
  customer_order_number?: string;
  tms_response?: string;
  error?: string;
  statusCode?: string;
  tms_status?: string;
  status?: string;
  token?: string;
  req_file_path?: string;
  req_file_uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ExpCommercialInvoiceDataPk = "id";
export type ExpCommercialInvoiceDataId = ExpCommercialInvoiceData[ExpCommercialInvoiceDataPk];
export type ExpCommercialInvoiceDataOptionalAttributes = "id" | "blessMessage" | "tms_req_message" | "shipment_Tracking_Number" | "customer_order_number" | "tms_response" | "error" | "statusCode" | "tms_status" | "status" | "token" | "req_file_path" | "req_file_uuid" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpCommercialInvoiceDataCreationAttributes = Optional<ExpCommercialInvoiceDataAttributes, ExpCommercialInvoiceDataOptionalAttributes>;

export class ExpCommercialInvoiceData extends Model<ExpCommercialInvoiceDataAttributes, ExpCommercialInvoiceDataCreationAttributes> implements ExpCommercialInvoiceDataAttributes {
  id!: number;
  blessMessage?: string;
  tms_req_message?: object;
  shipment_Tracking_Number?: string;
  customer_order_number?: string;
  tms_response?: string;
  error?: string;
  statusCode?: string;
  tms_status?: string;
  status?: string;
  token?: string;
  req_file_path?: string;
  req_file_uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpCommercialInvoiceData {
    return ExpCommercialInvoiceData.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    blessMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tms_req_message: {
      type: DataTypes.JSON,
      allowNull: true
    },
    shipment_Tracking_Number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tms_response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    statusCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tms_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    req_file_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    req_file_uuid: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exp_commercial_invoice_data',
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
