import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RegistrationNumbersAttributes {
  id: number;
  parent_id: number;
  registration_type?: string;
  type_code?: string;
  number?: string;
  issuer_country_code?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type RegistrationNumbersPk = "id";
export type RegistrationNumbersId = RegistrationNumbers[RegistrationNumbersPk];
export type RegistrationNumbersOptionalAttributes = "id" | "registration_type" | "type_code" | "number" | "issuer_country_code" | "createdAt" | "updatedAt" | "deletedAt";
export type RegistrationNumbersCreationAttributes = Optional<RegistrationNumbersAttributes, RegistrationNumbersOptionalAttributes>;

export class RegistrationNumbers extends Model<RegistrationNumbersAttributes, RegistrationNumbersCreationAttributes> implements RegistrationNumbersAttributes {
  id!: number;
  parent_id!: number;
  registration_type?: string;
  type_code?: string;
  number?: string;
  issuer_country_code?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof RegistrationNumbers {
    return RegistrationNumbers.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registration_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    issuer_country_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registration_numbers',
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
