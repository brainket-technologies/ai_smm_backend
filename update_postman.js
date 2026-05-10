import fs from 'fs';

const filePath = 'backend/postman_collection.json';
let content = fs.readFileSync(filePath, 'utf8');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzIiwidmVyc2lvbiI6MiwiZGV2aWNlSWQiOiJTUDFBLjIxMDgxMi4wMTYiLCJpYXQiOjE3Nzc5OTI3NTYsImV4cCI6MTc4MDU4NDc1Nn0.UiGQ42YK34HTdcf4IlwHCGpPhwzWqw5b03OABidswXs";
const apiKey = "brandboost_ai_key_789";
const businessId = "8";
const deviceId = "SP1A.210812.016";
const deviceType = "android";

// Replace variables
content = content.replace(/\{\{token\}\}/g, token);
content = content.replace(/\{\{apikey\}\}/g, apiKey);
content = content.replace(/\{\{business_id\}\}/g, businessId);
content = content.replace(/\{\{device_id\}\}/g, deviceId);
content = content.replace(/\{\{device_type\}\}/g, deviceType);

// Ensure Content-Type and Accept are present in headers
// This is a bit more complex with regex on JSON, but I'll try to update the AI Module section specifically.

fs.writeFileSync(filePath, content);
console.log("Postman collection updated with literal values.");
