import moment from 'moment';
import { Logger } from '../logger/Logger';
import { DI } from '../di/DIContainer';
import { Md5 } from 'ts-md5/dist/md5';
import * as fs from 'fs';
export class GenericUtil {

    private logger: Logger;
    constructor() {
        this.logger = DI.get(Logger);
    }

    getFormattedDate(date: Date, format: string): string {
        return moment(date).format(format);
    }

    getDefaultFormattedDate(date: Date): string {
        return this.getFormattedDate(date, 'YYYY-MM-DD');
    }

    getDefaultLongFormattedDate(date: Date): string {
        return this.getFormattedDate(date, 'YYYY-MM-DD HH:mm:ss');
    }

    getLocalDateFromDefaultFormat(dateStr: string): Date {
        return this.getLocalDateFromString(dateStr, 'YYYY-MM-DD');
    }

    getLocalDateFromString(dateStr: string, format: string): Date {
        const date = moment(dateStr, format).toDate();
        return this.getLocalDate(date);
    }

    getLocalDate(date: Date): Date {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }

    jsonToQueryString(json: any) {
        return '?' +
            Object.keys(json).map(function (key) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
    }


    static generateRandomHash() {
        return Md5.hashStr((new Date()).toString());
    }

    static generateHash(data: any) {
        try {
            console.log("generatehash--->", Md5.hashStr((data).toString()))
            return Md5.hashStr((data).toString());
        } catch (error) {
            console.log(`Error=========`)
            throw error;
        }
    }

    static async delay(ms: number) {
        console.log("Waiting for 2 sec")
        return new Promise( resolve => setTimeout(resolve, ms) );
    }


    validateJsonObject(jsonObj:any){
        for (const key in jsonObj) {
          if (jsonObj.hasOwnProperty(key)) {
            const value = jsonObj[key];
      
            if (value === null || value === undefined) {
              return `Error: Value for key '${key}' is empty or undefined.`;
            }
      
            if (typeof value === 'string' && value.trim() === '') {
              return `Error: Value for key '${key}' is an empty string.`;
            }
      
            if (Array.isArray(value) && value.length === 0) {
              return `Error: Value for key '${key}' is an empty array.`;
            }
      
            if (typeof value === 'object') {
              const nestedError:any = this.validateJsonObject(value);
              if (nestedError) {
                return nestedError;
              }
            }
          }
        }
      
        return null; // Return null if there are no errors
    }

    //Function to read the UOM Json file and return the JsonObject
    async readJsonFile(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                // console.log("uomData in the Json file------->",jsonData)
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
            });
        });
    }
}
