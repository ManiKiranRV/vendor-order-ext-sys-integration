import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DocumentsAttributes {
  id: number;
  customerordernumber?: string;
  sequence_timestamp?: string;
  shiptrackingnum?: string;
  typecode?: string;
  path?: string;
  name?: string;
  label?: string;
  content?: string;
  upload_status?: string;
  responseerrorcode?: string;
  responseerrortitle?: string;
  responseerrordetail?: string;
  responsetimestamp?: string;
}

export type DocumentsPk = "id";
export type DocumentsId = Documents[DocumentsPk];
export type DocumentsOptionalAttributes = "id" | "customerordernumber" | "sequence_timestamp" | "shiptrackingnum" | "typecode" | "path" | "name" | "label" | "content" | "upload_status" | "responseerrorcode" | "responseerrortitle" | "responseerrordetail" | "responsetimestamp";
export type DocumentsCreationAttributes = Optional<DocumentsAttributes, DocumentsOptionalAttributes>;

export class Documents extends Model<DocumentsAttributes, DocumentsCreationAttributes> implements DocumentsAttributes {
  id!: number;
  customerordernumber?: string;
  sequence_timestamp?: string;
  shiptrackingnum?: string;
  typecode?: string;
  path?: string;
  name?: string;
  label?: string;
  content?: string;
  upload_status?: string;
  responseerrorcode?: string;
  responseerrortitle?: string;
  responseerrordetail?: string;
  responsetimestamp?: string;


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
    sequence_timestamp: {
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
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    upload_status: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    responseerrorcode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    responseerrortitle: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    responseerrordetail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responsetimestamp: {
      type: DataTypes.STRING(45),
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
