import { Repository } from "./Repository";
import { Logger } from "../../logger/Logger";
import { DI } from "../../di/DIContainer";
import {  Transaction } from "sequelize/types";
import { Model } from 'sequelize';


export class BaseRepository implements Repository {
    private logger: Logger;

    constructor() {
        this.logger = DI.get(Logger);
    }

    getModel(): any {
        return Model;
    }

    async get(whereObj: any, attributes?: any[], transaction?: Transaction): Promise<any[]> {
        this.logger.log("Attributes in Lines Get ", attributes);
        if (attributes !== null && attributes !== undefined) {
            return await new Promise((resolve, reject) => {
                this.getModel().findAll({ attributes: attributes, where: whereObj, transaction }).then((get: any[]) => {
                    resolve(get);
                }).catch((error: any) => {
                    this.logger.error(error);
                    reject(error);
                });
            })
        } else {
            return await new Promise((resolve, reject) => {
                this.getModel().findAll({ where: whereObj, transaction }).then((get: any[]) => {
                    resolve(get);
                }).catch((error: any) => {
                    this.logger.error(error);
                    reject(error);
                });
            })
        }
    }

   

    async getCount(whereObj: any, attributes?: any[], transaction?: Transaction): Promise<any[]> {
        return await new Promise((resolve, reject) => {
            this.getModel().count({ where: whereObj, transaction }).then((get: any[]) => {
                resolve(get);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        })
    }

    async getByOrder(whereObj: any, orderBy?: any[], transaction?: Transaction): Promise<any[]> {
        return await new Promise((resolve, reject) => {
            this.getModel().findAll({ where: whereObj, order:orderBy,transaction }).then((get: any[]) => {
                resolve(get);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        })
    }

    async create(obj: any, transaction?: Transaction): Promise<any> {
        return await new Promise((resolve, reject) => {
            this.getModel().create(obj, { transaction }).then((created: any) => {
                resolve(created);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        });
    }

    async update(whereObj: any, updateObj: any, transaction?: Transaction): Promise<Number> {
        return await new Promise((resolve, reject) => {
            this.getModel().update(updateObj, { where: whereObj, transaction }).then((update: [number, any[]]) => {
                resolve(update[0]);
            }).catch((error: any) => {
                this.logger.error(error);
                reject(error);
            });
        });
    }


    async updateOrCreate(obj: any, uniqueFieldsWhereObj?: any, transaction?: Transaction): Promise<any> {
        let foundItem: any = false;
        if (Object.keys(uniqueFieldsWhereObj).length > 0) {
            foundItem = await this.getModel().findOne({ where: uniqueFieldsWhereObj, transaction });
        }

        return await new Promise((resolve, reject) => {
            let item = null;
            if (!foundItem) {
                item = this.getModel().create(obj, { transaction });
                resolve(item)
            } else {
                item = this.getModel().update(obj, { where: uniqueFieldsWhereObj, transaction });
                resolve(item)
            }
        });
    }


}