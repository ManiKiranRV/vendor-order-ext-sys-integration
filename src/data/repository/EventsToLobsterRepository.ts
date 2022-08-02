import { BvEventsToLobster } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class EventsToLobsterRepository extends BaseRepository {
   
    getModel():any{
        return BvEventsToLobster;
    }
   
}