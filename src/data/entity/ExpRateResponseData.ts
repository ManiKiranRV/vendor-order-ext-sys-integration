import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpRateResponseDataAttributes {
  id: number;
  message?: object;
  shipper_account_number?: string;
  sequence_timestamp?: string;
  shipper_postalCode?: string;
  receiver_postalCode?: string;
  customer_order_number?: string;
  vcid?: string;
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

export type ExpRateResponseDataPk = "id";
export type ExpRateResponseDataId = ExpRateResponseData[ExpRateResponseDataPk];
export type ExpRateResponseDataOptionalAttributes = "id" | "message" | "shipper_account_number" | "sequence_timestamp" | "shipper_postalCode" | "receiver_postalCode" | "customer_order_number" | "vcid" | "token" | "statusCode" | "status" | "error_reason" | "req_file_path" | "req_file_uuid" | "parent_uuid" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpRateResponseDataCreationAttributes = Optional<ExpRateResponseDataAttributes, ExpRateResponseDataOptionalAttributes>;

export class ExpRateResponseData extends Model<ExpRateResponseDataAttributes, ExpRateResponseDataCreationAttributes> implements ExpRateResponseDataAttributes {
  id!: number;
  message?: object;
  shipper_account_number?: string;
  sequence_timestamp?: string;
  shipper_postalCode?: string;
  receiver_postalCode?: string;
  customer_order_number?: string;
  vcid?: string;
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


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpRateResponseData {
    return ExpRateResponseData.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    message: {
      type: DataTypes.JSON,
      allowNull: true
    },
    shipper_account_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sequence_timestamp: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    shipper_postalCode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    receiver_postalCode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    vcid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    statusCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exp_rate_response_data',
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
