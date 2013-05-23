window.onload = function(){

	this.socket = io.connect('0.0.0.0:8000/');

	this.getData = window.location.search;
	this.getObj = new QueryData();
	this.user = {};
	
	this.showsListed = false;
	this.showsShown = false;
	
	this.listShow = function(showId){
		$.ajax({
			url : "/listShow",
			type : "POST",
			data : {
				"showId" : showId
			},
			success : function(data){
				console.log(data);
				var newLi = document.createElement("li");
				newLi.innerHTML = data.showName;
				newLi.addEventListener("click", function(){window.location = "editShow.html?usr="+window.user.name+"&key="+getObj.key+"&fun=edit&show="+data._id;})
				$("#showList").append(newLi);
			}
		});
	};
	
	//Get a list of the current show ID's for the user. The next function gets the data for those shows.
	this.getShows = function(e){
		if(this.showsListed === false){
			$.ajax({
				url : "/getShows",
				type : "POST",
				data : {
					"usr" : window.user.id
				},
				success : function(data){
					for(var i = 0; i < data.shows.length; i++){
						window.listShow(data.shows[i]);
					}
				}
			});
		}
	};
	
	this.getInvitations = function(){
		for(inv in this.user.permissions){
			if(this.user.shows.indexOf(this.user.permissions[inv]) === -1){
				var showName;
				$.ajax({
					url : "/queryShowName",
					type : "POST",
					async : false,
					data : {
						"id" : window.user.permissions[inv]
					},
					success : function(data){
						showName = data.showName;
					}
				});
				var newLi = document.createElement("li");
				var newH5 = document.createElement("h5");
				$(newH5).html(showName);
				$(newH5).addClass("invName");
				var accept = document.createElement("h5");
				$(accept).html("Accept");
				$(accept).addClass("invButton");
				$(accept).click(function(){
					window.socket.emit("acceptShow", {"showId" : window.user.permissions[inv], "userId" : window.user.id});
				});
				var decline = document.createElement("h5");
				$(decline).html("Decline");
				$(decline).addClass("invButton");
				$(decline).click(function(){
					window.socket.emit("declineShow", {"showId" : window.user.permissions[inv], "userId" : window.user.id});
				});
				$(newLi).append(newH5);
				$(newLi).append(accept);
				$(newLi).append(decline);
				$("#invitationList").append(newLi);
			}
		}
	};
	
	this.runPage = function(){
		$("#message").html("Hello, " + this.user.name + "!");
		//$("#showButt").click(listShows);
		$("#addShow").click(function(e){window.location = "editShow.html?usr=" + window.user.name + "&key=" + getObj.key +"&fun=add";});
		$("#invHead").click(function(){$("#invitationList").slideToggle("slow");});
		this.getShows();
		this.getInvitations();
	};

	var userCheck = validUser(getObj.usr, getObj.key);
	if(userCheck){
		this.user = userCheck;
		this.runPage();
	} else {
		window.location = "login.html";
	}
	
	this.socket.on("refreshData", function(data){
		window.user = validUser(getObj.usr, getObj.key);
		$("#invitationList").empty();
		$("#showList").empty();
		window.runPage();
	});
	
}();
