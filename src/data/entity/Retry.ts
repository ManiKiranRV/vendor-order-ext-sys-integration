import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface RetryAttributes {
  id: number;
  parent_id: number;
  message_type: string;
  retry_count: number;
  retry_status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type RetryPk = "id";
export type RetryId = Retry[RetryPk];
export type RetryOptionalAttributes = "id" | "retry_status" | "createdAt" | "updatedAt" | "deletedAt";
export type RetryCreationAttributes = Optional<RetryAttributes, RetryOptionalAttributes>;

export class Retry extends Model<RetryAttributes, RetryCreationAttributes> implements RetryAttributes {
  id!: number;
  parent_id!: number;
  message_type!: string;
  retry_count!: number;
  retry_status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Retry {
    return Retry.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message_type: {
      type: DataTypes.STRING(225),
      allowNull: false
    },
    retry_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    retry_status: {
      type: DataTypes.STRING(225),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'retry',
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
