import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface AppUsersAttributes {
  id: number;
  email_id: string;
  password: string;
  user_type: string;
  user_id?: string;
  user_org?: string;
  user_role?: string;
  organiation_type?: string;
  creation_date?: string;
  last_update_date?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type AppUsersPk = "id";
export type AppUsersId = AppUsers[AppUsersPk];
export type AppUsersOptionalAttributes = "id" | "user_id" | "user_org" | "user_role" | "organiation_type" | "creation_date" | "last_update_date" | "createdAt" | "updatedAt" | "deletedAt";
export type AppUsersCreationAttributes = Optional<AppUsersAttributes, AppUsersOptionalAttributes>;

export class AppUsers extends Model<AppUsersAttributes, AppUsersCreationAttributes> implements AppUsersAttributes {
  id!: number;
  email_id!: string;
  password!: string;
  user_type!: string;
  user_id?: string;
  user_org?: string;
  user_role?: string;
  organiation_type?: string;
  creation_date?: string;
  last_update_date?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof AppUsers {
    return AppUsers.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: "emailid"
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_type: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: "userid"
    },
    user_org: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_role: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    organiation_type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    creation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    last_update_date: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'app_users',
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
        name: "emailid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email_id" },
        ]
      },
      {
        name: "userid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
