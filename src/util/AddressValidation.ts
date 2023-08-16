/*
    This is specific to Commercial Invoice
    **Validating Address field in Commercial Invoice Template 
*/

import { GenericUtil } from "./GenericUtil";
import { DI } from '../di/DIContainer';
import { Logger } from '../logger/Logger';

import { PostalAddress } from "../types/postalAddress";
import { Details } from "../types/subAddressStruct";
import { ContactInformation } from "../types/contactInformation";
import { RegistrationNumbers } from "../types/registrationNumbers";
import { Address } from "../types/mainAddress";
import { ErrorFields } from "./ErrorFields";

import { OrganisationContactRepository } from "../data/repository/OrganisationContactRepository";
import { RegistrationNumbersRepository } from "../data/repository/RegistrationNumbersRepository";
import { or } from "sequelize";

export class AddressValidation {

    private GenericUtil:GenericUtil;
    private logger: Logger;
    private OrganisationContactRepository:OrganisationContactRepository;
    private RegistrationNumbersRepository:RegistrationNumbersRepository;
    private ErrorFields:ErrorFields;

    constructor() {
        this.GenericUtil = DI.get(GenericUtil);
        this.logger = DI.get(Logger);
        this.OrganisationContactRepository = DI.get(OrganisationContactRepository);
        this.RegistrationNumbersRepository = DI.get(RegistrationNumbersRepository);
        this.ErrorFields = DI.get(ErrorFields);
    }

    //To construct the Main Json Structure
    async getDataAfterValidation(data:any,org:any) {
        try{

            this.logger.log("Data in AddressValidation---->",data)
            let sellerData:any
            let buyerData:any
            let returnObject:any
            if(org === process.env.ORG_NAME){
                sellerData = data.find((item:any) => item.address_type.toLowerCase() === process.env.SELLER)
                this.logger.log("sellerData---->",sellerData)
                buyerData = data.find((item:any) => item.address_type.toLowerCase() === process.env.BUYER)
                this.logger.log("buyerData---->",buyerData)
            }else{
    
                sellerData = [data.find((item:any) => item.address_type === "SELLER")];
                // this.logger.log("sellerData---->",sellerData)
                buyerData = [data.find((item:any) => item.address_type === "BUYER")]
                // this.logger.log("buyerData---->",buyerData)
            }
            let sellerDetails:any
            let buyerDetails:any
            //If SELLER Details exists 
            if(sellerData){
                //Then check the mandatory fileds in postal address
                const afterValidationDetails:any = await this.validationForPostalAddressDetails(sellerData)
                
                this.logger.log("afterValidationDetails for sellerData",afterValidationDetails)
                //If status == success the construct the struct for Seller
    
                if(afterValidationDetails.status === "Success"){
                    const details : Details = {
                        postalAddress: afterValidationDetails.data.postalAddress,
                        contactInformation: afterValidationDetails.data.contactInformation,
                        registrationNumbers: afterValidationDetails.data.registrationNumbers,
                        typeCode: "business"
                    }
                    sellerDetails = details
                    
                    this.logger.log("sellerDetails id success-------->",sellerDetails)
                }else{
                    // Return Error
                    return ({"status":"Error","data":afterValidationDetails.data})
                }
            }
            //If BUYER Details exists 
            if(buyerData){
                //Then check the mandatory fileds in postalAddress,contactInformation,registrationNumbers
                const afterValidationDetails:any = await this.validationForPostalAddressDetails(buyerData)

                this.logger.log("afterValidationDetails for buyerData",afterValidationDetails)
    
                 //If status == success the construct the struct for Buyer
                if(afterValidationDetails.status === "Success"){
                    const details : Details = {
                        postalAddress: afterValidationDetails.data.postalAddress,
                        contactInformation: afterValidationDetails.data.contactInformation,
                        registrationNumbers: afterValidationDetails.data.registrationNumbers,
                        typeCode: "business"
                    }
                    buyerDetails = details
                    this.logger.log("buyerDetails if success-------->",buyerDetails)
                }else{
                    // Return Error
                    return ({"status":"Error","data":afterValidationDetails.data})
                }
            }
    
            //Mapping seller & buyer details to the Adddress Object
            const address: Address ={
                sellerDetails:sellerDetails,
                buyerDetails:buyerDetails
            }

            // if (!address || typeof address !== 'object') {
            //     return true; // Address is not an object or is falsy
            //   }
            
              // Check if both sellerDetails and buyerDetails are empty
            //   if (
            //     (!address.sellerDetails || Object.keys(address.sellerDetails).length === 0) &&
            //     (!address.buyerDetails || Object.keys(address.buyerDetails).length === 0)
            //   ) {
            //     this.logger.log("No Data in the seller & buyrer details")
            //   }else{
                if (
                        (address.sellerDetails) ||
                        (address.buyerDetails)
                ) { 
                this.logger.log("address----------->",address)
                return ({"status":"Success","data":address})
              }
    
        }catch(error){
            this.logger.log("Error",error)
        }
    }

    // For checking the madatory fields in Postal Address
    async validationForPostalAddressDetails(data:any) {
        try{

            this.logger.log("Postal Address",data)
            let dataObject:any = {}
            let contactInformation:any
            let registrationNumbers:any =[]
            const postalAddress : PostalAddress = {
                cityName: data.city,
                countryCode: data.country_code,
                postalCode: data.zip,
                addressLine1: data.line1,
                addressLine2:data.line2
            }
            
            //If optional field is null or empty then remove
            if((postalAddress.addressLine2 === null) || (postalAddress.addressLine2 === "")){
                delete postalAddress["addressLine2"]
            }
            this.logger.log("postalAddress---------->",postalAddress)
            
            // To check all the mandatory fields exist or not
            let resultForPostalAddValid:any = await this.checkMandatoryFields(postalAddress,process.env.POSTAL_ADDRESS_MANDATORY_FIELDS,"postalAddress")
            // this.logger.log("resultForPostalAddValid----->",resultForPostalAddValid)
    
             //If status == success the construct the struct for Postal Address
            if(resultForPostalAddValid.status === "Success"){

                //Adding postalAddress to dataObject if success
                dataObject["postalAddress"] = postalAddress
                // this.logger.log("dataObject postalAddress",dataObject)
               
                //If Postal Address exists & mandatory fileds are there then fetch the details from organization_contact by passing parent_id
                const whereObj:any={}
                whereObj["parent_id"]=data.id
                let contInfo :any = await this.OrganisationContactRepository.get({"parent_id":data.id})
                this.logger.log("contInfo---->",contInfo)
                
                //If data is there in OrganisationContactRepository
                if(contInfo.length>0){
                    
                    //constructing the Contract Information Object
                    const contractDetails : ContactInformation ={
                        phone: contInfo[0].phone,
                        mobilePhone: contInfo[0].mobilePhone,
                        companyName: contInfo[0].companyName,
                        fullName: contInfo[0].full_Name,
                        email: contInfo[0].email
                    }
                    
                    this.logger.log("contractDetails---------->",contractDetails)

                    
                    //If optional field is null or empty then remove
                    if((contractDetails.email === null) || (contractDetails.email === "")){
                        delete contractDetails["email"]
                    }
                    if((contractDetails.mobilePhone === null) || (contractDetails.mobilePhone === "")){
                        delete contractDetails["mobilePhone"]
                    }
    
                    //Checking whether all the mandatory fields are there or not
                    let resultForConInfoValid:any = await this.checkMandatoryFields(contractDetails,process.env.CONTRACT_INFORMATION_MANDATORY_FIELDS,"contactInformation")
                    // this.logger.log("resultForConInfoValid------>",resultForConInfoValid)
                    
                    //If mandatory fields exists then map the contractDetails to contractInformation
                    if(resultForConInfoValid.status === "Success"){
                        //Adding contactInformation to dataObject if success
                        dataObject["contactInformation"] = contractDetails
                        // this.logger.log("dataObject contactInformation",dataObject)
                        // this.logger.log("contactInformation-------->",contactInformation)
                    }else{
                        return ({"status":"Error","data":resultForConInfoValid.message})
                    }
                }
    
                //If Postal Address exists & mandatory fileds are there then fetch the details from registraction_number by passing parent_id
                let regInfo :any = await this.RegistrationNumbersRepository.get({"parent_id":data.id})
                this.logger.log("regInfo---->",regInfo)
    
                //If data is there in RegistrationNumbersRepository
                if(regInfo.length>0){
                    for(let regDetails of regInfo){
    
                        //constructing the Registration Number Object
                        const regNumDetails : RegistrationNumbers ={
                            issuerCountryCode:regDetails.issuer_country_code,
                            number:regDetails.number,
                            typeCode:regDetails.type_code
                        }
    
                        //If optional field is null or empty then remove
                        if((regNumDetails.issuerCountryCode === null) ||(regNumDetails.issuerCountryCode === "")){
                            delete regNumDetails["issuerCountryCode"]
                        }
    
                        //Checking whether all the mandatory fields are there or not
                        let resultForRegNumValid:any = await this.checkMandatoryFields(regNumDetails,process.env.REGISTRATION_NUMBER_MANDATORY_FIELDS,"registrationNumbers")
                        // this.logger.log("resultForRegNumValid------->",resultForRegNumValid)
                        
                        //If mandatory fields exists then map the regNumDetails to registrationNumbers
                        if(resultForRegNumValid.status === "Success"){
                            let res =regNumDetails
                            registrationNumbers.push(res)
                        }else{
                            return ({"status":"Error","data":resultForRegNumValid.message})
                        }

                    }
                    //Adding registrationNumbers to dataObject if success
                    dataObject["registrationNumbers"] = registrationNumbers
                    // this.logger.log("dataObject registrationNumbers",dataObject)
                }
                this.logger.log("dataObject",dataObject)
                return ({"status":"Success","data":dataObject})
            }else{
                return ({"status":"Error","data":resultForPostalAddValid.message})
            }
        }catch(error){
            this.logger.log("Error",error)
        }

    }

    //For checking Mandatory fields exists or not

    async checkMandatoryFields(mandatoryData:any,mandatoryfield:any,table:any) {
        const mandatoryFields:any = mandatoryfield.split(',')
        this.logger.log("mandatoryData--------->",mandatoryData)
        this.logger.log("mandatoryFields",mandatoryFields)
        let error:any =[]
        for (let field of mandatoryFields) {
            this.logger.log("mandatoryData[field]-------->",mandatoryData[field])
            if ((!mandatoryData[field]) || (mandatoryData[field].trim() === "") || (mandatoryData[field].trim() === null)) {
                let fieldName:any = await this.ErrorFields.getErrorFields(table)
                this.logger.log("filedName--------->",fieldName[field])
                this.logger.log(`Error : ${fieldName[field]} is a mandatory field and must be provided.`)
                error.push(`In ${table}, ${fieldName[field]} is a mandatory field and and its empty or null.`);
            }
        }
        if (error.length > 0) {
            this.logger.log(`Errors : ${error.join(" | ")}`);
            return { "status": "Error", "message": error.join(" | ") };
        }
        else{
            return ({"status":"Success"})
        }
        
    }


}