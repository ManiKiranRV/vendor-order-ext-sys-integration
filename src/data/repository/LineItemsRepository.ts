import { LineItems } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class LineItemsRepository extends BaseRepository {
   
    getModel():any{
        return LineItems;
    }
   
}