import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpTmsDataAttributes {
  id: number;
  message?: object;
  shipment_Tracking_Number?: string;
  status?: string;
  token?: string;
  uuid?: string;
  customer_order_number?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ExpTmsDataPk = "id";
export type ExpTmsDataId = ExpTmsData[ExpTmsDataPk];
export type ExpTmsDataOptionalAttributes = "id" | "message" | "shipment_Tracking_Number" | "status" | "token" | "uuid" | "customer_order_number" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpTmsDataCreationAttributes = Optional<ExpTmsDataAttributes, ExpTmsDataOptionalAttributes>;

export class ExpTmsData extends Model<ExpTmsDataAttributes, ExpTmsDataCreationAttributes> implements ExpTmsDataAttributes {
  id!: number;
  message?: object;
  shipment_Tracking_Number?: string;
  status?: string;
  token?: string;
  uuid?: string;
  customer_order_number?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpTmsData {
    return ExpTmsData.init({
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
    shipment_Tracking_Number: {
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
    uuid: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'exp_tms_data',
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
