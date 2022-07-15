import type { Sequelize } from "sequelize";
import { ExpResponseData } from "./ExpResponseData";
import type { ExpResponseDataAttributes, ExpResponseDataCreationAttributes } from "./ExpResponseData";
import { ExpTmsData } from "./ExpTmsData";
import type { ExpTmsDataAttributes, ExpTmsDataCreationAttributes } from "./ExpTmsData";

export {
  ExpResponseData,
  ExpTmsData,
};

export type {
  ExpResponseDataAttributes,
  ExpResponseDataCreationAttributes,
  ExpTmsDataAttributes,
  ExpTmsDataCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  ExpResponseData.initModel(sequelize);
  ExpTmsData.initModel(sequelize);


  return {
    ExpResponseData: ExpResponseData,
    ExpTmsData: ExpTmsData,
  };
}
