const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());

app.post('/create-opportunity', async (req, res) => {
    console.log('Received data:', req.body);

    const firstName = req.body.first_name || "Unknown";
    const lastName = req.body.last_name || "Unknown";
    const location = req.body.location || {};  // Ensure location exists to avoid errors
    const address = location.address || "N/A";
    const city = location.city || "N/A";
    const state = location.state || "CA";
    const country = location.country || "US";
    const source = req.body.contact_source || "N/A";
    const email = req.body.email || "N/A";
    const phone = req.body.phone || "N/A";
    const contactType = req.body.contact_type || "New Lead";
    const note = req.body.Note || req.body["Any notes on the condition of your car, or the service you're wanting to book."] || '';
    const carMake = req.body['Car Make'] || req.body['Car Make '] || ''; // Handling both cases
    const serviceReq = req.body['Service You Require?']?.[0] || ''; // Safe access to first element of array

    const notes = "Note: " + note + 
                  (carMake ? `\nCar Make: ${carMake}` : '') + 
                  (serviceReq ? `\nService: ${serviceReq}` : '');

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
        "customData": [],
        "notes": notes || "N/A"  // Ensure notes is either constructed or defaulted to 'N/A'
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

    const urableResponse =  await fetch("https://app.urable.com/api/v1/customers", requestOptions);
    const urableResult = await urableResponse.text();
    console.log(urableResult);

    res.status(200).send({
        body: raw // this will include the entire JSON data sent by the webhook
    });

});