import fs from 'fs';

const filePath = 'backend/postman_collection.json';
let content = fs.readFileSync(filePath, 'utf8');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzIiwidmVyc2lvbiI6MiwiZGV2aWNlSWQiOiJTUDFBLjIxMDgxMi4wMTYiLCJpYXQiOjE3Nzc5OTI3NTYsImV4cCI6MTc4MDU4NDc1Nn0.UiGQ42YK34HTdcf4IlwHCGpPhwzWqw5b03OABidswXs";
const apiKey = "brandboost_ai_key_789";
const businessId = "8";
const deviceId = "SP1A.210812.016";
const deviceType = "android";

// 1. Restore placeholders in headers and bodies
content = content.replace(new RegExp(token, 'g'), "{{token}}");
content = content.replace(new RegExp(apiKey, 'g'), "{{apikey}}");
// Be careful with businessId "8" as it might appear in other contexts, but here it's usually in headers or bodies
content = content.replace(/"value": "8"/g, '"value": "{{business_id}}"');
content = content.replace(new RegExp(deviceId, 'g'), "{{device_id}}");
content = content.replace(new RegExp(deviceType, 'g'), "{{device_type}}");

// 2. Update variables array at the end
const variables = [
    { key: "base_url", value: "https://ai-smm-backend.vercel.app" },
    { key: "apikey", value: apiKey },
    { key: "token", value: token },
    { key: "business_id", value: businessId },
    { key: "device_id", value: deviceId },
    { key: "device_type", value: deviceType }
];

// Simple regex to find the variable section and replace it
const variableSectionRegex = /"variable": \[\s+[\s\S]+?\]/;
const newVariableSection = `"variable": ${JSON.stringify(variables, null, 8)}`;
content = content.replace(variableSectionRegex, newVariableSection);

fs.writeFileSync(filePath, content);
console.log("Postman collection updated: literal values moved to variables, placeholders restored.");
