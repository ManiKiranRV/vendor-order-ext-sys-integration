import { Retry } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class RetryRepository extends BaseRepository {
   
    getModel():any{
        return Retry;
    }
   
}