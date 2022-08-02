import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface BvEventsToLobsterAttributes {
  id?: any;
  hawb?: string;
  shipperId?: string;
  customerOrderNumber?: string;
  events?: object;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type BvEventsToLobsterPk = "id";
export type BvEventsToLobsterId = BvEventsToLobster[BvEventsToLobsterPk];
export type BvEventsToLobsterOptionalAttributes = "id" | "hawb" | "shipperId" | "customerOrderNumber" | "events" | "createdAt" | "updatedAt" | "deletedAt";
export type BvEventsToLobsterCreationAttributes = Optional<BvEventsToLobsterAttributes, BvEventsToLobsterOptionalAttributes>;

export class BvEventsToLobster extends Model<BvEventsToLobsterAttributes, BvEventsToLobsterCreationAttributes> implements BvEventsToLobsterAttributes {
  id?: any;
  hawb?: string;
  shipperId?: string;
  customerOrderNumber?: string;
  events?: object;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof BvEventsToLobster {
    return BvEventsToLobster.init({
    id: {
      type: DataTypes.BLOB,
      allowNull: true,
      primaryKey: true
    },
    hawb: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shipperId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    customerOrderNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    events: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'BV_EVENTS_TO_LOBSTER',
    timestamps: true,
    paranoid: true
  });
  }
}
