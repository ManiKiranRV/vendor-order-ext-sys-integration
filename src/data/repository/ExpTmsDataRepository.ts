
import { ExpTmsData } from "../entity/ExpTmsData";
import { BaseRepository } from "./BaseRepository";

export class ExpTmsDataRepository extends BaseRepository{
    getModel():any{
        return ExpTmsData;
    }
}