
import { Repository } from "./Repository";
import { Logger } from "../../logger/Logger";
import { DI } from "../../di/DIContainer";
import { ExpResponseData} from "../entity/init-models";
import Sequelize = require('sequelize');
import {  Transaction } from "sequelize/types";

export class ExpResponseDataRepository extends Repository{
    private logger :Logger;
    constructor(){
        super();
        this.logger = DI.get(Logger)
    }


    async get(whereObj: any): Promise<ExpResponseData[]> {
        whereObj = (whereObj == undefined && whereObj == null) ? {} : whereObj
        return await new Promise((resolve, reject) => {
            ExpResponseData.findOne({
                where: whereObj
            }).then((get: any) => {
                resolve(get);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        })
    }


    async create(obj: any, transaction?: Transaction): Promise<ExpResponseData> {
        return await new Promise((resolve, reject) => {
            ExpResponseData.create(obj, { transaction }).then((created: ExpResponseData) => {
                resolve(created);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        });
    }
}