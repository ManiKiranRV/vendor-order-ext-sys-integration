/*
    This is specific to Error Fields Names
    **Mapping of Values to Error Fields Names Template 
*/


export class ErrorFields {



    async getErrorFields(table:any) {

        console.log("tables------>",table)

        let obj :any

        if(table === "postalAddress"){

            obj = {  
                "cityName": "cityName",
                "countryCode": "countryCode",
                "postalCode": "postalCode",
                "addressLine1": "addressLine1"
            }
        }

        if(table === "contactInformation"){

            obj = {  
                "phone": "phoneNumber",
                "companyName": "companyName",
                "fullName": "fullName"
            }
        }

        if(table === "registrationNumbers"){

            obj = {  
                "number":"registrationNumber",
                "typeCode":"typeCode" 
            }
        }

        console.log("obj----->",obj)
        return obj

    }

}