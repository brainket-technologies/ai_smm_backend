import json

with open('postman_collection.json', 'r') as f:
    collection = json.load(f)

def process_item(item):
    if 'item' in item:
        for subitem in item['item']:
            process_item(subitem)
    
    if 'request' in item:
        headers = item['request'].get('header', [])
        has_apikey = any(h.get('key') == 'apikey' for h in headers)
        has_device_id = any(h.get('key') == 'device-id' for h in headers)
        has_device_type = any(h.get('key') == 'device-type' for h in headers)
        
        if has_apikey:
            if not has_device_id:
                headers.append({ "key": "device-id", "value": "unique_device_id_123", "type": "text" })
            if not has_device_type:
                headers.append({ "key": "device-type", "value": "android", "type": "text" })
        
        item['request']['header'] = headers

for item in collection['item']:
    process_item(item)

with open('postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=4)
