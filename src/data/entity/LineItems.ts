import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface LineItemsAttributes {
  id: number;
  customerordernumber?: string;
  serial_number?: string;
  description?: string;
  price?: number;
  quantity_value?: number;
  quantity_uom?: string;
  commoditytype?: string;
  commodityhscode?: string;
  manufacturercountry?: string;
  net_value?: number;
  netvalue_uom?: string;
  gross_value?: number;
  grossvalue_uom?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type LineItemsPk = "id";
export type LineItemsId = LineItems[LineItemsPk];
export type LineItemsOptionalAttributes = "id" | "customerordernumber" | "serial_number" | "description" | "price" | "quantity_value" | "quantity_uom" | "commoditytype" | "commodityhscode" | "manufacturercountry" | "net_value" | "netvalue_uom" | "gross_value" | "grossvalue_uom" | "createdAt" | "updatedAt" | "deletedAt";
export type LineItemsCreationAttributes = Optional<LineItemsAttributes, LineItemsOptionalAttributes>;

export class LineItems extends Model<LineItemsAttributes, LineItemsCreationAttributes> implements LineItemsAttributes {
  id!: number;
  customerordernumber?: string;
  serial_number?: string;
  description?: string;
  price?: number;
  quantity_value?: number;
  quantity_uom?: string;
  commoditytype?: string;
  commodityhscode?: string;
  manufacturercountry?: string;
  net_value?: number;
  netvalue_uom?: string;
  gross_value?: number;
  grossvalue_uom?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof LineItems {
    return LineItems.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customerordernumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    quantity_value: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    quantity_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    commoditytype: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    commodityhscode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    manufacturercountry: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    net_value: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    netvalue_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    gross_value: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    grossvalue_uom: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'line_items',
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
