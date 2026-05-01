import json

with open('postman_collection.json', 'r') as f:
    collection = json.load(f)

def process_item(item):
    if 'item' in item:
        for subitem in item['item']:
            process_item(subitem)
    
    if 'request' in item:
        headers = item['request'].get('header', [])
        for h in headers:
            if h.get('key') == 'device-id':
                h['value'] = "{{device_id}}"
            elif h.get('key') == 'device-type':
                h['value'] = "{{device_type}}"
        
        item['request']['header'] = headers

for item in collection['item']:
    process_item(item)

# Add variables to the variable list if not already there
if 'variable' not in collection:
    collection['variable'] = []

variables = collection['variable']
var_keys = [v.get('key') for v in variables]

if 'device_id' not in var_keys:
    variables.append({ "key": "device_id", "value": "unique_device_id_123" })
if 'device_type' not in var_keys:
    variables.append({ "key": "device_type", "value": "android" })

with open('postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=4)
