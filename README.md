# ECE_inventory_system

The ECE department would like an inventory system to track items.



## Setup:

###Install MongoDB
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
```

Then,
```
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
```

###Install Node
```
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
cd ECE_inventory_system/src && npm install
node server.js
```
###Then access the site at:
https://localhost:8443

