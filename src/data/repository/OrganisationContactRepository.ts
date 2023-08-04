
import { OrganisationContact } from "../entity/OrganisationContact";
import { BaseRepository } from "./BaseRepository";

export class OrganisationContactRepository extends BaseRepository{
    getModel():any{
        return OrganisationContact;
    }
   
}