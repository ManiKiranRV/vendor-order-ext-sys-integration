/*
    This is specific to Commercial Invoice
    **Mapping of Values to Commercial Invoice Template 
*/
export class CommercialInvoiceMapping {
    static getData() {
        return (
            {
                "shipmentTrackingNumber": "",
                "content": {
                    "exportDeclaration": [
                        {
                            "lineItems": [
                                {
                                    "number": "",
                                    "commodityCodes": [
                                        {
                                            "value": "",
                                            "typeCode": ""
                                        }
                                    ],
                                    "quantity": {
                                        "unitOfMeasurement": "",
                                        "value": ""
                                    },
                                    "price": "",
                                    "description": "",
                                    "weight": {
                                        "netValue": ""
                                    },
                                    "manufacturerCountry": ""
                                }
                            ],
                            "invoice": {
                                "date": "",
                                "number": "",
                                "function": ""
                            },
                            "incoterm": ""
                        }
                    ],
                    "currency": "",
                    "unitOfMeasurement": ""
                }
            }
        )
        
    }
}
