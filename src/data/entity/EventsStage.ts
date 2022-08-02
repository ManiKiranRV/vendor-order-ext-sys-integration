import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface EventsStageAttributes {
  id: number;
  parent_id?: number;
  hawb?: string;
  event_type?: string;
  event_code?: string;
  event_desc?: string;
  event_location?: string;
  event_date?: Date;
  event_offset?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type EventsStagePk = "id";
export type EventsStageId = EventsStage[EventsStagePk];
export type EventsStageOptionalAttributes = "id" | "parent_id" | "hawb" | "event_type" | "event_code" | "event_desc" | "event_location" | "event_date" | "event_offset" | "createdAt" | "updatedAt" | "deletedAt";
export type EventsStageCreationAttributes = Optional<EventsStageAttributes, EventsStageOptionalAttributes>;

export class EventsStage extends Model<EventsStageAttributes, EventsStageCreationAttributes> implements EventsStageAttributes {
  id!: number;
  parent_id?: number;
  hawb?: string;
  event_type?: string;
  event_code?: string;
  event_desc?: string;
  event_location?: string;
  event_date?: Date;
  event_offset?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof EventsStage {
    return EventsStage.init({
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
    hawb: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    event_type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    event_code: {
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
    }
  }, {
    sequelize,
    tableName: 'events_stage',
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
        name: "idx_parent_id",
        using: "BTREE",
        fields: [
          { name: "parent_id" },
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
