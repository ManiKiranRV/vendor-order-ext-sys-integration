
import { ExpRateTmsData } from "../entity/ExpRateTmsData";
import { BaseRepository } from "./BaseRepository";

export class ExpRateTmsDataRepository extends BaseRepository{
    getModel():any{
        return ExpRateTmsData;
    }
}