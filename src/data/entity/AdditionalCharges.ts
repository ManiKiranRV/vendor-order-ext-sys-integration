import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AdditionalChargesAttributes {
  id: number;
  parent_id?: number;
  chargeCode?: string;
  chargeDescription?: string;
  chargeAmount?: number;
}

export type AdditionalChargesPk = "id";
export type AdditionalChargesId = AdditionalCharges[AdditionalChargesPk];
export type AdditionalChargesOptionalAttributes = "id" | "parent_id" | "chargeCode" | "chargeDescription" | "chargeAmount";
export type AdditionalChargesCreationAttributes = Optional<AdditionalChargesAttributes, AdditionalChargesOptionalAttributes>;

export class AdditionalCharges extends Model<AdditionalChargesAttributes, AdditionalChargesCreationAttributes> implements AdditionalChargesAttributes {
  id!: number;
  parent_id?: number;
  chargeCode?: string;
  chargeDescription?: string;
  chargeAmount?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof AdditionalCharges {
    return AdditionalCharges.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    chargeCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    chargeDescription: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    chargeAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'additional_charges',
    timestamps: false,
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
