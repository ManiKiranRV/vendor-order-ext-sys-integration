/*
    This is specific to Commercial Invoice
    **Mapping of Values to Commercial Invoice Template 
*/
export class CommercialInvoiceMapping {
    async getData(data:any,res:any) {
        let lineItem:any = await this.lineItemsMapping(data.line_item)
        return (
            {
                "shipmentTrackingNumber": data.shipmentTrackingNumber,
                "content": {
                    "exportDeclaration": [
                        {
                            "lineItems": lineItem,
                            "invoice": {
                                "date": data.invoice_date,
                                "number": data.invoice_number,
                                "function": "both" //default
                            },
                            "incoterm": data.incoterm
                        }
                    ],
                    "currency": data.currency,
                    "unitOfMeasurement": "metric" //default
                }
            }

        )

    }

    async lineItemsMapping(data:any){

        let lineItem:any =[]
        for (let lineDetails of data){

            let obj={
                    "number": parseFloat(lineDetails.number),
                    "commodityCodes": [
                        {
                            "value": (parseFloat(lineDetails.commodity_value)).toString(),
                            "typeCode": lineDetails.commodity_typeCode
                        }
                    ],
                    "quantity": {
                        "unitOfMeasurement": lineDetails.quantity_uom,
                        "value": parseFloat(lineDetails.quantity_value)
                    },
                    "price": parseFloat(lineDetails.price),
                    "description": lineDetails.description,
                    "weight": {
                        "netValue": parseFloat(lineDetails.weight_netValue)
                    },
                    "manufacturerCountry": lineDetails.manufacturerCountry
                }
            lineItem.push(obj)
        }
        console.log("lineItem--->",lineItem)
        return lineItem
    }



}