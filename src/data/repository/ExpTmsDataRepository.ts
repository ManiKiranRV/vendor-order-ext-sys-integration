
import { Repository } from "./Repository";
import { Logger } from "../../logger/Logger";
import { DI } from "../../di/DIContainer";
import { ExpTmsData} from "../entity/init-models";
import Sequelize = require('sequelize');
import {  Transaction } from "sequelize/types";

export class ExpTmsDataRepository extends Repository{
    private logger :Logger;
    constructor(){
        super();
        this.logger = DI.get(Logger)
    }


    async get(whereObj: any): Promise<ExpTmsData[]> {
        whereObj = (whereObj == undefined && whereObj == null) ? {} : whereObj
        return await new Promise((resolve, reject) => {
            ExpTmsData.findOne({
                where: whereObj
            }).then((get: any) => {
                resolve(get);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        })
    }


    async create(obj: any, transaction?: Transaction): Promise<ExpTmsData> {
        return await new Promise((resolve, reject) => {
            ExpTmsData.create(obj, { transaction }).then((created: ExpTmsData) => {
                resolve(created);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        });
    }
}