import { RegistrationNumbers } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class RegistrationNumbersRepository extends BaseRepository {
   
    getModel():any{
        return RegistrationNumbers;
    }
   
}