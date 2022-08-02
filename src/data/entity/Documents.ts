import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DocumentsAttributes {
  id: number;
  customerordernumber?: string;
  shiptrackingnum?: string;
  typecode?: string;
  path?: string;
  name?: string;
  label?: string;
}

export type DocumentsPk = "id";
export type DocumentsId = Documents[DocumentsPk];
export type DocumentsOptionalAttributes = "id" | "customerordernumber" | "shiptrackingnum" | "typecode" | "path" | "name" | "label";
export type DocumentsCreationAttributes = Optional<DocumentsAttributes, DocumentsOptionalAttributes>;

export class Documents extends Model<DocumentsAttributes, DocumentsCreationAttributes> implements DocumentsAttributes {
  id!: number;
  customerordernumber?: string;
  shiptrackingnum?: string;
  typecode?: string;
  path?: string;
  name?: string;
  label?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof Documents {
    return Documents.init({
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
    shiptrackingnum: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    typecode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    path: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'documents',
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
