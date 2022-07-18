import { Transaction } from "sequelize/types";

export interface Repository { 
    get(whereObj: any,attributes?:any[], transaction?: Transaction):Promise<any[]>;
    create(obj: any, transaction?: Transaction): Promise<any>;
    update(whereObj: any, updateObj: any, transaction?: Transaction): Promise<Number>;
    updateOrCreate(obj : any,allowWithSameId?:any, transaction?:any):Promise<any>;

}


//export class Repository { }