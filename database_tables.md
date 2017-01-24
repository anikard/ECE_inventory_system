Database Tables & Endpoints

## USERS
Item | Type 
--- | --- 
id | Integer
username | String
Password | encoded String
Email | String

## ITEMS
Item | Type | Required?
--- | --- | ---
id | Integer
Name | String | Required
Quantity | Integer | Required
Model # | String
Description | String
Location | String
Tags | String []

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

