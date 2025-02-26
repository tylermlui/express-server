const express = require('express');

const app = express();
const port = 3001; 
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());

app.listen(port, () => console.log("IT's alive"));

app.get('/best', (req, res) => {
    res.status(200).send({
        vehicle: 'Honda Civic',
        year: '2006'
    });
});
app.post('/send', (req, res) => {
    console.log('Received data:', req.body);

    const firstName = req.body.first_name || "Unknown";
    const lastName = req.body.last_name || "Unknown";
    const location = req.body.location;
    const address = location.address || "N/A";
    const city = location.city || "N/A";
    const state = location.state || "CA";
    const country = location.country || "US";
    const source = req.body.contact_source || "N/A";
    const email = req.body.email || "N/A";
    const phone = req.body.phone || "N/A";
    const contactType = req.body.contact_type || "New Lead";
    const note = req.body.Note || req.body["Any notes on the condition of your car, or the service you're wanting to book."] || '';
    const carMake = req.body['Car Make']  || ''
    const serviceReq = req.body['Service You Require?'][0] || ''
    const customData = [carMake, serviceReq]

    var raw = json.stringify({
        "type": "person",
        "status": "new",
        "firstName": firstName,
        "lastName": lastName,
        "locations": [
            {
                "label": "Home",
                "value": {
                    "address": {
                        "line1": address,
                        "line2": "",
                        "city": city,
                        "state": state,
                        "country": country
                    }
                }
            }
        ],
        "phoneNumbers": [
            {
                "label": "Mobile",
                "value": phone
            }
        ],
        "emails": [
            {
                "label": "Home",
                "value": email
            }
        ],
        "origin": source,
        "taxExempt": false,
        "color": {
            "name": contactType,
            "hex": "#2fd2a8"
        },
        "customData": [customData],
        "notes": note
    
    });
    res.status(200).send({
        body: raw // this will include the entire JSON data sent by the webhook
    });

    // const urableHeaders = new Headers();
    // urableHeaders.append("Content-Type", "application/json");
    // urableHeaders.append("Authorization", process.env.URLABLE_API_KEY);

    // var requestOptions = {
    //     method: 'POST',
    //     headers: urableHeaders,
    //     body: raw,
    //     redirect: 'follow'
    // };

    // const urableResponse =  fetch("https://app.urable.com/api/v1/customers", requestOptions);
    // const urableResult = urableResponse.text();
    // console.log(urableResult);

    // res.status(200).json({ message: "Success", obj }); // Send response after fetch completes

});
app.post('/hook', async (req, res) => {
    try {
        console.log(req.body)
        const leadconnectorHeaders = new Headers();
        leadconnectorHeaders.append("Authorization", process.env.LEADCONNECTOR_API_KEY);
        leadconnectorHeaders.append("Version", "2021-07-28");
        leadconnectorHeaders.append("Accept", "application/json");

        const options = {
            method: 'GET',
            headers: leadconnectorHeaders
        };

        const response = await fetch("https://services.leadconnectorhq.com/opportunities/" + req.body.id, options);
        const obj = await response.json();  

        console.log(obj); 

        const myArray = (obj.opportunity.contact.name || "").split(" ");
        const firstName = myArray[0] || "Unknown";
        const lastName = myArray[1] || "Unknown";

        var raw = JSON.stringify({
            "type": "person",
            "status": "new",
            "firstName": firstName,
            "lastName": lastName,
            "locations": [
                {
                    "label": "Home",
                    "value": {
                        "address": {
                            "line1": "N/A",
                            "line2": "",
                            "city": "N/A",
                            "state": "N/A",
                            "country": "US"
                        }
                    }
                }
            ],
            "phoneNumbers": [
                {
                    "label": "Mobile",
                    "value": obj.opportunity.contact.phone || "None"
                }
            ],
            "emails": [
                {
                    "label": "Home",
                    "value": obj.opportunity.contact.email || "None"
                }
            ],
            "origin": obj.opportunity.source,
            "taxExempt": false,
            "color": {
                "name": "New Lead",
                "hex": "#2fd2a8"
            },
            "customData": [],
            "notes": obj.opportunity.name
        });

        const urableHeaders = new Headers();
        urableHeaders.append("Content-Type", "application/json");
        urableHeaders.append("Authorization", process.env.URLABLE_API_KEY);

        var requestOptions = {
            method: 'POST',
            headers: urableHeaders,
            body: raw,
            redirect: 'follow'
        };

        const urableResponse = await fetch("https://app.urable.com/api/v1/customers", requestOptions);
        const urableResult = await urableResponse.text();
        console.log(urableResult);

        res.status(200).json({ message: "Success", obj }); // Send response after fetch completes

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
