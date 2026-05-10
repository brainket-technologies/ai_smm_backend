import fs from 'fs';

const filePath = 'backend/postman_collection.json';
let content = fs.readFileSync(filePath, 'utf8');

// Remove businessId from raw JSON bodies
content = content.replace(/\\"businessId\\": \\"8\\",\\n/g, "");
content = content.replace(/\\"businessId\\": \\"8\\"/g, "");

fs.writeFileSync(filePath, content);
console.log("Postman collection bodies cleaned of businessId.");
