import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AddressAttributes {
  id: number;
  parent_id?: number;
  customer_order_number?: string;
  address_id?: string;
  address_type?: string;
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country_code?: string;
  country_name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type AddressPk = "id";
export type AddressId = Address[AddressPk];
export type AddressOptionalAttributes = "id" | "parent_id" | "customer_order_number" | "address_id" | "address_type" | "name" | "line1" | "line2" | "city" | "state" | "zip" | "country_code" | "country_name" | "createdAt" | "updatedAt" | "deletedAt";
export type AddressCreationAttributes = Optional<AddressAttributes, AddressOptionalAttributes>;

export class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  id!: number;
  parent_id?: number;
  customer_order_number?: string;
  address_id?: string;
  address_type?: string;
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country_code?: string;
  country_name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Address {
    return Address.init({
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
    customer_order_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    line1: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    line2: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    country_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'address',
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
