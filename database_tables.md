Database Tables & Endpoints

## USERS
Item | Type 
--- | --- 
id | Integer
username | String
Password | encoded String
Email | String
Status | String

## ITEMS
Item | Type | Required?
--- | --- | ---
id | Integer
Name | String | Required
Quantity | Integer | Required
Model # | String
Description | String
Location | String
Fields | {}
Tags | String []
Custom Fields | {}

## REQUESTS
Item | Type 
--- | --- 
id | Integer
Item_id | Integer
Quantity | integer
User_id | Integer
Reason | String
Admin_note | String
Status | String

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
default | 
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



