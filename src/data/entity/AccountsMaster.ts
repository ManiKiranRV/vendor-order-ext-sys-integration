import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AccountsMasterAttributes {
  id: number;
  bill_toparty_account?: string;
  shipper_account?: string;
  consignee_account?: string;
  account_description?: string;
  rate_identifier?: string;
  business_unit?: string;
  bless_identifier?: string;
}

export type AccountsMasterPk = "id";
export type AccountsMasterId = AccountsMaster[AccountsMasterPk];
export type AccountsMasterOptionalAttributes = "id" | "bill_toparty_account" | "shipper_account" | "consignee_account" | "account_description" | "rate_identifier" | "business_unit" | "bless_identifier";
export type AccountsMasterCreationAttributes = Optional<AccountsMasterAttributes, AccountsMasterOptionalAttributes>;

export class AccountsMaster extends Model<AccountsMasterAttributes, AccountsMasterCreationAttributes> implements AccountsMasterAttributes {
  id!: number;
  bill_toparty_account?: string;
  shipper_account?: string;
  consignee_account?: string;
  account_description?: string;
  rate_identifier?: string;
  business_unit?: string;
  bless_identifier?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof AccountsMaster {
    return AccountsMaster.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bill_toparty_account: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    shipper_account: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    consignee_account: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    account_description: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rate_identifier: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    business_unit: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    bless_identifier: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'accounts_master',
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
