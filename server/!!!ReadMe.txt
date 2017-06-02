To start server side:

Go to the bin folder and did this in the command line:   node www

At the packager.json must be config:

 		"main": "server.js",   
 		"build": "dev",                       // "dev" or "prod"   minify or not sources  
 		"DataBaseHost": "78.46.244.10:27017",    // start mongoDB and input here host
 
 
 
 
 
 
/////// Install MongoDB ///////////
created the mongod.cfg like this:

		dbpath = C:\Program Files\MongoDB 2.6 Standard\data\db
		logpath = C:\Program Files\MongoDB 2.6 Standard\logs
		noauth = true

I saved it under: C:\Program Files\MongoDB 2.6 Standard\

Create a service that will automatically start MongoDB.
Then did this in the command line:

		sc.exe create MongoDB binPath= "\"C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe\" --service --config=\"C:\Program Files\MongoDB 2.6 Standard\mongod.cfg\"" DisplayName= "MongoDB 2.6 Standard" start= "auto"

Start MongoDB. Did this in the command line:

		mongod.exe

You should then be able to go to http://localhost:27017 and see the following message:

  		You are trying to access MongoDB on the native driver port. For http diagnostic access, add 1000 to the port number
		  
////////////////////////////////