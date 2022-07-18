import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface OrganisationContactAttributes {
  id: number;
  parent_id?: number;
  address_id?: string;
  phone?: string;
  full_Name?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type OrganisationContactPk = "id";
export type OrganisationContactId = OrganisationContact[OrganisationContactPk];
export type OrganisationContactOptionalAttributes = "id" | "parent_id" | "address_id" | "phone" | "full_Name" | "email" | "createdAt" | "updatedAt" | "deletedAt";
export type OrganisationContactCreationAttributes = Optional<OrganisationContactAttributes, OrganisationContactOptionalAttributes>;

export class OrganisationContact extends Model<OrganisationContactAttributes, OrganisationContactCreationAttributes> implements OrganisationContactAttributes {
  id!: number;
  parent_id?: number;
  address_id?: string;
  phone?: string;
  full_Name?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof OrganisationContact {
    return OrganisationContact.init({
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
    address_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    full_Name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'organisation_contact',
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
