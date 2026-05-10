import fs from 'fs';

const filePath = 'backend/postman_collection.json';
let content = fs.readFileSync(filePath, 'utf8');
let json = JSON.parse(content);

function addBusinessIdHeader(items) {
    for (let item of items) {
        if (item.item) {
            addBusinessIdHeader(item.item);
        } else if (item.request && item.request.header) {
            const headers = item.request.header;
            const hasAuth = headers.some(h => h.key === 'Authorization');
            const hasBusinessId = headers.some(h => h.key.toLowerCase() === 'x-business-id');

            if (hasAuth && !hasBusinessId) {
                headers.push({
                    "key": "x-business-id",
                    "value": "{{business_id}}",
                    "type": "text"
                });
            }
        }
    }
}

addBusinessIdHeader(json.item);

fs.writeFileSync(filePath, JSON.stringify(json, null, 4));
console.log("X-Business-Id header added to all authenticated requests in Postman collection.");
