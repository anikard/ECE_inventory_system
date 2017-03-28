Database Tables & Endpoints

## USERS
Item | Type 
--- | --- 
id | Integer
username | String
name | String
netId | String
date | Date
salt | String
email | String
status | String
hash | String
active | Boolean
apiKey | String
subscribed | String

## ITEMS
Item | Type | Required?
--- | --- | ---
id | Integer
name | String | Required
quantity | Integer
quantity_available | Integer
model | String
description | String
fields | {type: {}}
image | String
custom_fields | {}

## REQUESTS
Item | Type 
--- | --- 
id | Integer
items | [{item: Item, quantity: number}]
reason | String
note | String
status | String
type | String
date | Date
dateFulfilled | Date

## CART
Item | Type | Required?
--- | --- 
user | User.id | Required
item | [(Item.id, Integer)]

## FIELD
Item | Type | Required?
--- | --- | ---
name | String | Required
type | String
access | String
req | Boolean
default | {{}}
date | Date

## LOG
Item | Type | Required?
--- | --- | ---
init_user | User.id | Required
item | Item.id
quantity | Integer [],
request | Request.id 
event | String 
rec_user | User.id
date | Date
admin_actions | String   
name_list | String []

## EMAIL
Item | Type | Required?
--- | --- | ---
subjectTag | String
subject | String
body | String
dates | String

