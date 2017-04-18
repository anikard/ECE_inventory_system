
### Program requirements:

OS: Ubuntu 14 or 16
Framework: MEAN (Node 6.x, MongoDB 3.4). 

For a full list of package dependencies, check the package.json[ECE_inventory_system/package.json] file found in the main page of this project

## Setup:

### Install MongoDB
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
```
For Ubuntu 14:
```
echo "deb [ arch=amd64 ] http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
```
For Ubuntu 16:
```
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
Then,
```
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
```

### Install Node
```
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs
```

Make a directory for global installations:
```
	mkdir ~/.npm-global
```
Configure npm to use the new directory path:
```
	npm config set prefix '~/.npm-global'
```
Open or create a ~/.profile file and add this line:
```
	export PATH=~/.npm-global/bin:$PATH
```
Back on the command line, update your system variables:
```
	source ~/.profile
```
Test: Download a package globally without using sudo.
```
    npm install -g jshint
```
```
npm install -g gulp bower
sudo npm install -g mean-cli 
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
Finally, clone and deploy the project
```
git clone https://github.com/anikard/ECE_inventory_system
cd ECE_inventory_system && npm install
node server.js >/dev/null 2>&1 &
```
### Then access the site at:
https://localhost:8443

#### admin credentials: username = admin; password = admin.

### Sample import string:
```
[{"name":"resistors","quantity":10, "quantity_available":10},{"name":"transistors","quantity":20, "quantity_available":20}]
```

### import system from api:
{ imports: '[{"name":"resistors","quantity":10, "quantity_available":10},{"name":"transistors","quantity":20, "quantity_available":20}]' }

Put `nodeapp.service` in /etc/systemd/system. Then type
```
# sudo systemctl daemon-reload
# sudo systemctl start nodeapp
```
Watch the logs at `sudo journalctl --follow -u nodeapp`


### procedure to install the system from scratch using backed up data

Locate the desired backup (daily/weekly/monthly) directory. 

Follow these steps to perform a restore:

1. Copy the encrypted archive file to the production server. 

2. Type the following in the SSH terminal of the production server.
```
# openssl enc -aes-256-cbc -d -k 1234567890 -in mongo.tar.gz.aes | gunzip > db.archive
# mongorestore --archive=db.archive
```
