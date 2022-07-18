import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface PackagesAttributes {
  id: number;
  parent_id?: number;
  customer_order_number?: string;
  gross_weight?: number;
  gross_weight_uom?: string;
  length?: number;
  length_uom?: string;
  width?: number;
  width_uom?: string;
  height?: number;
  height_uom?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type PackagesPk = "id";
export type PackagesId = Packages[PackagesPk];
export type PackagesOptionalAttributes = "id" | "parent_id" | "customer_order_number" | "gross_weight" | "gross_weight_uom" | "length" | "length_uom" | "width" | "width_uom" | "height" | "height_uom" | "description" | "createdAt" | "updatedAt" | "deletedAt";
export type PackagesCreationAttributes = Optional<PackagesAttributes, PackagesOptionalAttributes>;

export class Packages extends Model<PackagesAttributes, PackagesCreationAttributes> implements PackagesAttributes {
  id!: number;
  parent_id?: number;
  customer_order_number?: string;
  gross_weight?: number;
  gross_weight_uom?: string;
  length?: number;
  length_uom?: string;
  width?: number;
  width_uom?: string;
  height?: number;
  height_uom?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Packages {
    return Packages.init({
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
    gross_weight: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    gross_weight_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    length: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    length_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    width: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    width_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    height: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    height_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'packages',
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
