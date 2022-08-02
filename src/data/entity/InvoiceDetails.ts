import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface InvoiceDetailsAttributes {
  id: number;
  customerordernumber?: string;
  mwab?: string;
  hawb?: string;
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
  additionalcharge?: number;
  additionalchargetype?: string;
}

export type InvoiceDetailsPk = "id";
export type InvoiceDetailsId = InvoiceDetails[InvoiceDetailsPk];
export type InvoiceDetailsOptionalAttributes = "id" | "customerordernumber" | "mwab" | "hawb" | "customerreference" | "typecode" | "uploadstatus" | "invoicenumber" | "invoicedate" | "declaredvalue" | "declaredvaluecurrency" | "incoterm" | "description" | "responseerrorcode" | "responseerrortitle" | "responseerrordetail" | "responsetimestamp" | "createdAt" | "updatedAt" | "deletedAt" | "additionalcharge" | "additionalchargetype";
export type InvoiceDetailsCreationAttributes = Optional<InvoiceDetailsAttributes, InvoiceDetailsOptionalAttributes>;

export class InvoiceDetails extends Model<InvoiceDetailsAttributes, InvoiceDetailsCreationAttributes> implements InvoiceDetailsAttributes {
  id!: number;
  customerordernumber?: string;
  mwab?: string;
  hawb?: string;
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
  additionalcharge?: number;
  additionalchargetype?: string;


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
    hawb: {
      type: DataTypes.STRING(255),
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
    },
    additionalcharge: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    additionalchargetype: {
      type: DataTypes.STRING(45),
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
