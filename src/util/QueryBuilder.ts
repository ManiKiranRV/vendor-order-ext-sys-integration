import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { Op, WhereOptions } from 'sequelize';
import { loggers } from "winston";


export class QueryBuilder {
    private logger: Logger;
    constructor() {
        this.logger = DI.get(Logger);
    }
    buildSortObj(sort:any){
        let sortArrayOfArrays:any = [];
        for(let sortKey in sort){
            sortArrayOfArrays.push([sortKey,sort[sortKey]])
          }
        return sortArrayOfArrays;
    }
    buildColFilterObj(colFilters:any,colSearch:any){
        let whereObj:any = {};
        let fullMessage;
        let status;
        let attributes;
        //ADD search condition to whereObj
        for(let colSearchKey in colSearch){
            whereObj[colSearchKey] = {[Op.like]: `%${colSearch[colSearchKey]}%`}
        }

        //Adding other conditions to where Obj
        for(let colFilterKey in colFilters){
            let ColFiltervalue = colFilters[colFilterKey][0];
  
            if(typeof ColFiltervalue === "object"){
              for(let key in ColFiltervalue){
                let value = ColFiltervalue[key];
                if(key.startsWith("DateBetween")){
                  whereObj[colFilterKey] = { [Op.between]: [new Date(value[0]), new Date(value[1])] }
                }
              }
            }else if(colFilterKey === "fullMessage"){ 
                fullMessage = ColFiltervalue;
            }else if(colFilterKey === "status"){ 
                status = ColFiltervalue;
            }else if(colFilterKey === "attributes"){ 
                attributes = colFilters[colFilterKey];
            }else{
              whereObj[colFilterKey] = colFilters[colFilterKey];
            }
          }

          return {fullMessage:fullMessage,status:status,whereObj:whereObj,attributes:attributes};

    }
}