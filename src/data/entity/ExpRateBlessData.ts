import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpRateBlessDataAttributes {
  id: number;
  message?: object;
  shipper_account_number?: string;
  sequence_timestamp?: string;
  shipper_postalCode?: string;
  receiver_postalCode?: string;
  customer_order_number?: string;
  status?: string;
  vcid?: string;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ExpRateBlessDataPk = "id";
export type ExpRateBlessDataId = ExpRateBlessData[ExpRateBlessDataPk];
export type ExpRateBlessDataOptionalAttributes = "id" | "message" | "shipper_account_number" | "sequence_timestamp" | "shipper_postalCode" | "receiver_postalCode" | "customer_order_number" | "status" | "vcid" | "token" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpRateBlessDataCreationAttributes = Optional<ExpRateBlessDataAttributes, ExpRateBlessDataOptionalAttributes>;

export class ExpRateBlessData extends Model<ExpRateBlessDataAttributes, ExpRateBlessDataCreationAttributes> implements ExpRateBlessDataAttributes {
  id!: number;
  message?: object;
  shipper_account_number?: string;
  sequence_timestamp?: string;
  shipper_postalCode?: string;
  receiver_postalCode?: string;
  customer_order_number?: string;
  status?: string;
  vcid?: string;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpRateBlessData {
    return ExpRateBlessData.init({
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
    status: {
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
    }
  }, {
    sequelize,
    tableName: 'exp_rate_bless_data',
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
