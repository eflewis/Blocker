var port2 = process.env.PORT || 3000;
//app.listen(port);

var io = require('socket.io').listen(port2);


io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

//var port = process.env.PORT || 3000;*/
//var io = require('socket.io').listen(3000);


var mongo = require('mongodb'),
Server = mongo.Server,
Db = mongo.Db;

var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/bloockerDB'; 
  
mongo.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
});


var server = new Server('mongoUri', 27017, {auto_reconnect: true});
var db = new Db('bloockerDB', server);
var users;

db.open(function(err, db) {
		  if(!err) {
			db.collection('users', function(err, collection) {
				users = collection;
			});
		  } else {
			console.log(err);
		  }
		});


io.sockets.on('connection', function(socket){
	socket.on("login", function(data){
		users.find({"_username" : data.username}).toArray(function(err, item){
			var userData = item[0];
			if(userData){
				if(userData.password === data.password){
					io.sockets.emit("loginSuccess", {username : userData._username, permissions : userData.showPermissionIds, shows : userData.showIdList});
				} else {
					io.sockets.emit("loginFailed", {"message" : "Invalid Password. Try again, or register if you don't have an account."});
				}
			} else {
				io.sockets.emit("loginFailed", {"message" : "User data not found. Try again, or register if you don't have an account."});
			}
		});
	});
	socket.on("register", function(data){
		console.log(data.username);
		users.findOne({"_username" : data.username}, function(err, item){
			if(err){
				console.log(err);
			} else {
				if(item === null){
					var toAdd = {
						"_username" : data.username,
						"password" : data.password,
						"showIdList" : [],
						"showPermissionIds" : []
					};
					users.insert(toAdd);
					io.sockets.emit("loginSuccess", {username : data.username, permissions : [], shows : []});
				}else{
					if(data.password == null || data.username == null){
						var mess = {
							message : "Please enter a valid username/password combo"
						};
						io.sockets.emit("regFail", mess);
					} else {
						var mess = {
							message : "That username is already in use!"
						};
						io.sockets.emit("regFail", mess);
					}
				}
			}
		});
	});
	
	socket.on("acceptShow", function(data){
		users.update({"_id" : mongo.ObjectID(data.userId)}, {$push : {"showIdList" : mongo.ObjectID(data.showId)}});
		io.sockets.emit("refreshData" , "hooray");
	});
	
	socket.on("cueChanged", function(data){
		io.sockets.emit("updateCue", data);
	});
	
	socket.on("showUpdated", function(data){
		io.sockets.emit("updateShow", data);
	});
});