import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface LaneInScopeAttributes {
  id: number;
  parent_id?: number;
  seller_country_code?: string;
  buyer_country_code?: string;
  valid_from?: Date;
  valid_to?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type LaneInScopePk = "id";
export type LaneInScopeId = LaneInScope[LaneInScopePk];
export type LaneInScopeOptionalAttributes = "id" | "parent_id" | "seller_country_code" | "buyer_country_code" | "valid_from" | "valid_to" | "createdAt" | "updatedAt" | "deletedAt";
export type LaneInScopeCreationAttributes = Optional<LaneInScopeAttributes, LaneInScopeOptionalAttributes>;

export class LaneInScope extends Model<LaneInScopeAttributes, LaneInScopeCreationAttributes> implements LaneInScopeAttributes {
  id!: number;
  parent_id?: number;
  seller_country_code?: string;
  buyer_country_code?: string;
  valid_from?: Date;
  valid_to?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof LaneInScope {
    return LaneInScope.init({
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
    seller_country_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    buyer_country_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: true
    },
    valid_to: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'lane_in_scope',
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
