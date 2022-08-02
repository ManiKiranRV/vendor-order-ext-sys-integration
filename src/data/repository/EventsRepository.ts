import { Events } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class EventsRepository extends BaseRepository {
   
    getModel():any{
        return Events;
    }
   
}