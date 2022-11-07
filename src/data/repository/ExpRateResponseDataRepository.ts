
import { ExpRateResponseData } from "../entity/ExpRateResponseData";
import { BaseRepository } from "./BaseRepository";

export class ExpRateResponseDataRepository extends BaseRepository{
    getModel():any{
        return ExpRateResponseData;
    }
   
}