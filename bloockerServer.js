var express = require("express");
var mongo = require('mongodb'),

Server = mongo.Server,
Db = mongo.Db;
var users;
var shows;
 
var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/bloockerDB'; 

 
mongo.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
});
//

var server = new Server('mongoUri', 27017, {auto_reconnect: true});
var db = new Db('bloockerDB', server);

db.open(function(err, db) {
		  if(!err) {
			db.collection('users', function(err, collection) {
				users = collection;
			}
			);
			db.collection('shows', function(err, collection) {
				shows = collection;
			}
			);
		  } else {
			console.log(err);
		  }
		});

var app = express();
var wwwDir = "/www";
app.use("/", express.static(__dirname));
app.use(express.bodyParser());
app.get("/", function(req, res) { res.sendfile("login.html");});
var port = process.env.PORT || 8000;
app.listen(port);

//var port2 = process.env.PORT || 3000;
//app.listen(port);

//var io = require('socket.io').listen(app);


//io.configure(function () {
//  io.set("transports", ["xhr-polling"]);
 // io.set("polling duration", 10);
//});

//var port = process.env.PORT || 3000;*/
//var io = require('socket.io').listen(3000);

/*
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
*/

var loggedUsersToKeys = [];

app.post("/login", function(req, res){
	var userName = req.body.username;
	var userKey = Math.floor(Math.random() * 1000000);
	loggedUsersToKeys[userName] = userKey;
	res.send({"usr" : userName, "key" : userKey});
});

app.post("/userCheck", function(req, res){
	if(loggedUsersToKeys[req.body.user] == req.body.code){
		users.findOne({"_username" : req.body.user}, function(err, item){	
			res.send(item);});
	} else {
		res.send("cheater");
	}
});

app.post("/removeRole", function(req,res){
	users.findOne({"_id" : mongo.ObjectID(req.body.user)}, function(err, item){
		var roles = item.roles;
		var newarr = [];
		for(var i = 0; i < roles[req.body.show].length; i++){
			if(roles[req.body.show][i] != req.body.roleName){
				newarr.push(roles[req.body.show][i]);
			}
		}
		roles[req.body.show] = newarr;
		users.update({"_id" : mongo.ObjectID(req.body.user)}, {$set : {"roles" : roles}});
		res.send("success");
	});
});

app.post("/addRole", function(req, res){
	users.findOne({"_id" : mongo.ObjectID(req.body.user)}, function(err, item){
		var newRoles = {};
		if(item.roles){
			newRoles = item.roles;
		}
		if(!newRoles[req.body.show]){
			newRoles[req.body.show] = [req.body.roleName];
		} else {
			newRoles[req.body.show].push(req.body.roleName);
		}
		console.log(newRoles);
		users.update({"_id" : mongo.ObjectID(req.body.user)}, {$set : {"roles" : newRoles}});
		res.send("success!");
	});
});

app.post("/queryShowName", function(req, res){
	shows.findOne({"_id" : mongo.ObjectID(req.body.id)}, {"showName" : 1}, function(err, item){
		res.send({"showName" : item.showName});
	});
});

//Add the new show to the shows db and the show id to the creators shows and permissions
app.post("/addShow", function(req, res){
	shows.insert(req.body.insert);
	shows.find({"showName" : req.body.insert.showName}).sort({$natural : -1}).limit(1).toArray(function(err, item){
		users.update({"_id" : mongo.ObjectID(req.body.user)}, {$push : {"showPermissionIds" : item[0]._id}});
		users.update({"_id" : mongo.ObjectID(req.body.user)}, {$push : {"showIdList" : item[0]._id}});
		res.send({"show" : item[0]._id});});
});

app.post("/loadShowEdit", function(req, res){
	shows.findOne({_id : mongo.ObjectID(req.body.id)}, function(err, item){
		if(item.writePermissions.indexOf(req.body.usrId) != -1  || item.viewPermissions.indexOf(req.body.usrId) != -1){
			res.send(item);
		} else {
			res.send({"err" : 1});
		}
	});
});

app.post("/listShow", function(req,res){
	shows.findOne({"_id" : mongo.ObjectID(req.body.showId)}, function(err, item){
		console.log(item);
		res.send(item);
	});
});
//Get the list of shows for this user. Then get their information and send it back.
app.post("/getShows", function(req, res){
	var user = req.body.usr;
	var data;
	users.findOne({"_id" : mongo.ObjectID(user)}, function(err, item){
		var showIds = item.showIdList;
		res.send({"shows" : showIds});
	});
});

app.post("/grantAccess", function(req,res){
	users.findOne({"_username" : req.body.user}, function(err, item){
		if(item == null){
			res.send({"err" : "something went wrong!"});
		} else if(req.body.accessType == "write"){
			users.update({"_username" : req.body.user}, {$push : {"showPermissionIds" : mongo.ObjectID(req.body.showId)}});
			shows.update({"_id" : mongo.ObjectID(req.body.showId)} , {$push : {"writePermissions" : item._id.toString()}});
			res.send("success");
		} else if(req.body.accessType == "view"){
			users.update({"_username" : req.body.user}, {$push : {"showPermissionIds" : mongo.ObjectID(req.body.showId)}});
			shows.update({"_id" : mongo.ObjectID(req.body.showId)} , {$push : {"viewPermissions" : item._id.toString()}});
			res.send("success");
		}
	});
});

app.post("/saveShow", function(req, res){
	console.log(req.body);
	shows.update({"_id" : mongo.ObjectID(req.body.id)}, {$set : {"showName" : req.body.showData.showName, "characters" :  req.body.showData.characters, "blocking" : req.body.showData.blocking}});
	res.send("success");
	});
