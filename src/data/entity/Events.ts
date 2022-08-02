import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface EventsAttributes {
  id: number;
  hawb?: string;
  shipperId?: string;
  event_code?: string;
  event_type?: string;
  event_desc?: string;
  event_location?: string;
  event_date?: Date;
  event_offset?: string;
  processing_status?: string;
  error_reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type EventsPk = "id";
export type EventsId = Events[EventsPk];
export type EventsOptionalAttributes = "id" | "hawb" | "shipperId" | "event_code" | "event_type" | "event_desc" | "event_location" | "event_date" | "event_offset" | "processing_status" | "error_reason" | "createdAt" | "updatedAt" | "deletedAt";
export type EventsCreationAttributes = Optional<EventsAttributes, EventsOptionalAttributes>;

export class Events extends Model<EventsAttributes, EventsCreationAttributes> implements EventsAttributes {
  id!: number;
  hawb?: string;
  shipperId?: string;
  event_code?: string;
  event_type?: string;
  event_desc?: string;
  event_location?: string;
  event_date?: Date;
  event_offset?: string;
  processing_status?: string;
  error_reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Events {
    return Events.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
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
    event_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    event_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    event_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    event_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    event_offset: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    processing_status: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    error_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'events',
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
      {
        name: "idx_event_code",
        using: "BTREE",
        fields: [
          { name: "event_code" },
        ]
      },
      {
        name: "idx_event_desc",
        using: "BTREE",
        fields: [
          { name: "event_desc" },
        ]
      },
      {
        name: "idx_event_date",
        using: "BTREE",
        fields: [
          { name: "event_date" },
        ]
      },
    ]
  });
  }
}
