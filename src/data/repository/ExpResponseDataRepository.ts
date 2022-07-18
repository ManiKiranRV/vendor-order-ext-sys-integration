
import { ExpResponseData } from "../entity/ExpResponseData";
import { BaseRepository } from "./BaseRepository";

export class ExpResponseDataRepository extends BaseRepository{
    getModel():any{
        return ExpResponseData;
    }
   
}