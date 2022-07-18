import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface InvoiceDetailsAttributes {
  id: number;
  customerordernumber?: string;
  mwab?: string;
  hwab?: string;
  customerreference?: string;
  typecode?: string;
  uploadstatus?: string;
  invoicenumber?: string;
  invoicedate?: string;
  declaredvalue?: number;
  declaredvaluecurrency?: string;
  incoterm?: string;
  description?: string;
  responseerrorcode?: string;
  responseerrortitle?: string;
  responseerrordetail?: string;
  responsetimestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type InvoiceDetailsPk = "id";
export type InvoiceDetailsId = InvoiceDetails[InvoiceDetailsPk];
export type InvoiceDetailsOptionalAttributes = "id" | "customerordernumber" | "mwab" | "hwab" | "customerreference" | "typecode" | "uploadstatus" | "invoicenumber" | "invoicedate" | "declaredvalue" | "declaredvaluecurrency" | "incoterm" | "description" | "responseerrorcode" | "responseerrortitle" | "responseerrordetail" | "responsetimestamp" | "createdAt" | "updatedAt" | "deletedAt";
export type InvoiceDetailsCreationAttributes = Optional<InvoiceDetailsAttributes, InvoiceDetailsOptionalAttributes>;

export class InvoiceDetails extends Model<InvoiceDetailsAttributes, InvoiceDetailsCreationAttributes> implements InvoiceDetailsAttributes {
  id!: number;
  customerordernumber?: string;
  mwab?: string;
  hwab?: string;
  customerreference?: string;
  typecode?: string;
  uploadstatus?: string;
  invoicenumber?: string;
  invoicedate?: string;
  declaredvalue?: number;
  declaredvaluecurrency?: string;
  incoterm?: string;
  description?: string;
  responseerrorcode?: string;
  responseerrortitle?: string;
  responseerrordetail?: string;
  responsetimestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof InvoiceDetails {
    return InvoiceDetails.init({
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
    mwab: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    hwab: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    customerreference: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    typecode: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    uploadstatus: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    invoicenumber: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    invoicedate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    declaredvalue: {
      type: DataTypes.DECIMAL(30,7),
      allowNull: true
    },
    declaredvaluecurrency: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    incoterm: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    responseerrorcode: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    responseerrortitle: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    responseerrordetail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    responsetimestamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'invoice_details',
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
