import { Documents } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class DocumentRepository extends BaseRepository {
   
    getModel():any{
        return Documents;
    }
   
}