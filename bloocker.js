
var currentUser;

function User(data){
	this.id = data._id;
	this.name = data._username;
	this.permissions = data.showPermissionIds;
	this.shows = data.showIdList;
	this.roles = data.roles;
}

function BlockPoint(data){
	this.cueLine = data.cue;
	this.directions = data.directions;
	this.characters = data.characters;
}

function Show(data){
	this.showName = data.showName;
	this.characters = data.characters;
	this.blocking = data.blocking;
	this.stage = {};
	this.viewPermissions = data.viewPermissions;
	this.editPermissions = data.writePermissions;
	
	this.blockingIndex = 0;
}

function validUser(usr, key){
	var result;
	$.ajax({
		async : false,
		url : "/userCheck",
		type : "POST",
		data : {
			"user" : usr,
			"code" : key
			},
		success : function(data){
					if(data == "cheater"){
						result = undefined;
					} else {
						result = new User(data);
					}
				}
	});
	return result;
}