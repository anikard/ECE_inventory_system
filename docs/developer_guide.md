For this project, we use a fairly basic MEAN.js template. For the new dev who does not know what MEAN is, it is the collection of MongoDB (database), Express (for routing), Angular (for front-end) and Node (for the server side framework). The new developer is encouraged to read an [overview of the MEAN stack](https://thinkster.io/tutorials/mean-stack) (Note: External link).

The code can be divided up to the client side and the server side, and the middleware in the config folders. The system is configured mainly as follows: server.js in root listens on a port, and when a request comes, it is routed through various middleware in backend as opposed to a single routes.js file. For either GET or POST HTTP requests, the router redirects it to the necessary controller (found in /server/controllers) associated with the request. For GET requests, the controller returns a HTML page (found in client), and for POST requests, the controller uses functions that manipulate the state of the database.

The database is composed of models (found in /server/controllers), and the database access is done through mongoose package. For a full layout of the models and database architecture used in the project, check [these database tables.](https://github.com/anikard/ECE_inventory_system/blob/master/database_tables.md) (Database tables have been updated for version 2)

The divide between front-end and back-end can also be seen from the network API, and the associated [API Guide](https://github.com/anikard/ECE_inventory_system/blob/master/client/APIDoc.pdf). The new developer is encouraged to fully read the API guide to see what methods are available.

To see how the project is deployed from a technical standpoint, check our [Deployment Guide](https://github.com/anikard/ECE_inventory_system/blob/ea89/README.md) located in our README file for the project. Independently of the deployment guide, here is a high overview on how the system is installed:
* Setup an operating system that supports MEAN stack (The current development team uses mainly Macintosh machines, though the code has been tested in Ubuntu 14, and Windows 8)
* Install MongoDB
* Install Node
* Install Git
* Clone the project
* Install the necessary packages with npm
* Contribute by forking and making pull requests onto the main branch

The developer joining the team is then encouraged to contribute to the development by creating their own branch in the GitHub repository to which this wiki belongs to. Since this is a web-based development project, many development environments are suitable, though our current team has used simple text editors such as Sublime and Vim. Since the setting instructions are given for a UNIX terminal, a UNIX based dev environment (such as a Mac or preferably Linux) is suggested. The project is officially supported for Ubuntu 14.  