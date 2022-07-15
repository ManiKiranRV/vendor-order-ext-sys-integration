import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ExpResponseDataAttributes {
  id: number;
  message: object;
  shipmentTrackingNumber: string;
  statusCode: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ExpResponseDataPk = "id";
export type ExpResponseDataId = ExpResponseData[ExpResponseDataPk];
export type ExpResponseDataOptionalAttributes = "id" | "createdAt" | "updatedAt" | "deletedAt";
export type ExpResponseDataCreationAttributes = Optional<ExpResponseDataAttributes, ExpResponseDataOptionalAttributes>;

export class ExpResponseData extends Model<ExpResponseDataAttributes, ExpResponseDataCreationAttributes> implements ExpResponseDataAttributes {
  id!: number;
  message!: object;
  shipmentTrackingNumber!: string;
  statusCode!: string;
  status!: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ExpResponseData {
    ExpResponseData.init({
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
      allowNull: false
    },
    statusCode: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false
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
  return ExpResponseData;
  }
}
