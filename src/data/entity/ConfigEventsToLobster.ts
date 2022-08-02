import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ConfigEventsToLobsterAttributes {
  id: number;
  event_code?: string;
  event_description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type ConfigEventsToLobsterPk = "id";
export type ConfigEventsToLobsterId = ConfigEventsToLobster[ConfigEventsToLobsterPk];
export type ConfigEventsToLobsterOptionalAttributes = "event_code" | "event_description" | "createdAt" | "updatedAt" | "deletedAt";
export type ConfigEventsToLobsterCreationAttributes = Optional<ConfigEventsToLobsterAttributes, ConfigEventsToLobsterOptionalAttributes>;

export class ConfigEventsToLobster extends Model<ConfigEventsToLobsterAttributes, ConfigEventsToLobsterCreationAttributes> implements ConfigEventsToLobsterAttributes {
  id!: number;
  event_code?: string;
  event_description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof ConfigEventsToLobster {
    return ConfigEventsToLobster.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    event_code: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    event_description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'config_events_to_lobster',
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
