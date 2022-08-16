import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpResponseDataAttributes {
  id: number;
  message: object;
  shipmentTrackingNumber?: string;
  customer_order_number?: string;
  token?: string;
  statusCode?: string;
  status?: string;
  error_reason?: string;
  req_file_path?: string;
  req_file_uuid?: string;
  parent_uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ExpResponseDataPk = "id";
export type ExpResponseDataId = ExpResponseData[ExpResponseDataPk];
export type ExpResponseDataOptionalAttributes = "id" | "shipmentTrackingNumber" | "customer_order_number" | "token" | "statusCode" | "status" | "error_reason" | "req_file_path" | "req_file_uuid" | "parent_uuid" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpResponseDataCreationAttributes = Optional<ExpResponseDataAttributes, ExpResponseDataOptionalAttributes>;

export class ExpResponseData extends Model<ExpResponseDataAttributes, ExpResponseDataCreationAttributes> implements ExpResponseDataAttributes {
  id!: number;
  message!: object;
  shipmentTrackingNumber?: string;
  customer_order_number?: string;
  token?: string;
  statusCode?: string;
  status?: string;
  error_reason?: string;
  req_file_path?: string;
  req_file_uuid?: string;
  parent_uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpResponseData {
    return ExpResponseData.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: DataTypes.JSON,
      allowNull: false
    },
    shipmentTrackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    statusCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    error_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    req_file_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    req_file_uuid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    parent_uuid: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exp_response_data',
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
