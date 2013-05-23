window.onload = function(){

	this.socket = io.connect('http://limitless-fjord-7379.herokuapp.com:3000/');

	this.getData = window.location.search;
	this.getObj = new QueryData();
	
	this.characters = [];
	this.blocking = [];
	
	this.show;
	this.user;
	
	this.getCharacters = function(){
		var charArray = [];
		var charLis = $("#characters").children("li");
	};
	
	this.listCharacters = function(){
		for(var j = 0;j < this.show.characters.length; j++){
			this.addChar(this.show.characters[j]);
		}
	};
	
	this.addBlocking = function(characters, directions, cue, index){
		if(cue == ""){return;}
		this.makeSkipListItem(index, cue);
		var charsForCue = $(".selected");
		var chs = [];
		for(var t = 0; t < charsForCue.length; t++){
			chs.push(charsForCue[t].firstChild.innerHTML);
		}
		var data = {
			"cue" : cue,
			"directions" : directions,
			"characters" : characters
		};
		var newBlock = new BlockPoint(data);
		this.blocking.push(newBlock);
		var newLi = document.createElement("li");
		newLi.id = newBlock.cueLine.replace(/\s|\?|'|!|,|"/g, "");
		var newH5 = document.createElement("h5");
		newH5.innerHTML = newBlock.cueLine;
		$(newLi).append(newH5);
		var newDiv = document.createElement("div");
		$(newDiv).append("<p>"+newBlock.directions+"</p>");
		for(character in newBlock.characters){
			$(newDiv).append("<h6>"+newBlock.characters[character]+"</h6>");
		}
		$(newLi).append(newDiv);
		
		$(newLi).click(function(){$(newDiv).slideToggle("slow")});
		$(newDiv).hide();
		$("#blocking").append(newLi);
	};
	
	this.addChar = function(name){
		var newCharName = name;
		this.characters.push(newCharName);
		
		console.log(this.characters);
		
		var newLi = document.createElement("li");
		newLi.innerHTML = newCharName;
		newLi.id = newCharName.replace(/\s|\?|'|!|,|"/g, "") + "Li";
		if(this.user.roles && this.user.roles[this.show.showName].indexOf(newCharName) != -1){
			$(newLi).addClass("role");
		}
		$(newLi).click(function(){
			if($(newLi).hasClass("role")){
				$(newLi).removeClass("role");
				$.ajax({
					url : "/removeRole",
					type : "POST",
					data : {
						"user" : window.user.id,
						"show" : window.show.showName,
						"roleName" : newCharName
					},
					success : function(data){
						console.log("updated roles!");
					}
				});
			} else {
				$(newLi).addClass("role");
				$.ajax({
					url : "/addRole",
					type : "POST",
					data : {
						"user" : window.user.id,
						"show" : window.show.showName,
						"roleName" : newCharName
					},
					success : function(data){
						console.log("updated roles!");
					}
				});
			}
		})
		$("#characters").append(newLi);
	};
	
	this.makeSkipListItem = function(index, line){
		var skipLi = document.createElement("li");
			$(skipLi).html(line);
			$(skipLi).click(function(){
				window.show.blockingIndex = index;
				$("#prevCue").empty();
				$("#currentCue").empty();
				$("#nextCue").empty();
				window.loadCues();
				window.socket.emit("cueChanged", {"showId" : getObj.show, "sender" : getObj.usr, "cueIndex" : window.show.blockingIndex});
			});
		$("#skipList").append(skipLi);
	};
	
	var userCheck = validUser(getObj.usr, getObj.key);
	if(userCheck){
		this.user = userCheck;
	} else {
		window.location = "login.html";
	}
	
	$.ajax({
		async : false,
		url : "/loadShowEdit",
		type : "POST",
		data : {
			"id" : getObj.show,
			"usrId" : window.user.id
		},
		success : function(data){
			window.show = new Show(data);
			
		}
	});
	
	if(this.show.viewPermissions.indexOf(this.user.id.toString()) === -1){
		window.location = "login.html";
	}
	$("#title").html(this.show.showName);
	if(this.show.characters){
		this.listCharacters();
	}
	if(this.show.blocking){
		for(var t = 0; t < this.show.blocking.length; t++){
			var currBlock = this.show.blocking[t];
			this.addBlocking(currBlock.characters, currBlock.directions, currBlock.cueLine, t);
		}
	}
	
	$("#skipList").hide();
	$("#showSkipList").click(function(){$("#skipList").slideToggle("fast")});
	$("#cueToCue").hide();
	
	this.loadCues = function(){
		if(this.blocking.length > 0){
			if(this.show.blockingIndex === 0){
				$("#prevCue").html("<h5>Beginning of Show</h5>");
				var currLine = document.createElement("h5");
				$(currLine).html(this.blocking[0].cueLine);
				var currDirect = document.createElement("h6");
				$(currDirect).html(this.blocking[0].directions);
				$("#currentCue").append(currLine);
				$("#currentCue").append(currDirect);
				for(ch in this.blocking[0].characters){
					$("#currentCue").append("<p>"+this.blocking[0].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
							if(this.blocking[0].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
								$(currLine).addClass("role");
							}
						}
				}
				if(this.blocking.length > 1){
					var nextLine = document.createElement("h5");
					$(nextLine).html(this.blocking[1].cueLine);
					var nextDirect = document.createElement("h6");
					$(nextDirect).html(this.blocking[1].directions);
					$("#nextCue").append(nextLine);
					$("#nextCue").append(nextDirect);
					for(ch in this.blocking[1].characters){
						$("#nextCue").append("<p>"+this.blocking[1].characters[ch]+"</p>");
						for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
							if(this.blocking[1].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
								$(nextLine).addClass("role");
							}
						}
					}
				} else {
					$("#nextCue").html("<h5>End of Show</h5>");
				}
			} else if(this.show.blockingIndex === this.blocking.length -1){
				var prevLine = document.createElement("h5");
				$(prevLine).html(this.blocking[this.show.blockingIndex-1].cueLine);
				var prevDirect = document.createElement("h6");
				$(prevDirect).html(this.blocking[this.show.blockingIndex-1].directions);
				$("#prevCue").append(prevLine);
				$("#prevCue").append(prevDirect);
				for(ch in this.blocking[this.show.blockingIndex-1].characters){
					$("#prevCue").append("<p>"+this.blocking[this.show.blockingIndex-1].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
						if(this.blocking[this.show.blockingIndex-1].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
							$(prevLine).addClass("role");
						}
					}
				}
				var currLine = document.createElement("h5");
				$(currLine).html(this.blocking[this.show.blockingIndex].cueLine);
				var currDirect = document.createElement("h6");
				$(currDirect).html(this.blocking[this.show.blockingIndex].directions);
				$("#currentCue").append(currLine);
				$("#currentCue").append(currDirect);
				for(ch in this.blocking[this.show.blockingIndex].characters){
					$("#currentCue").append("<p>"+this.blocking[this.show.blockingIndex].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
						if(this.blocking[this.show.blockingIndex].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
							$(currLine).addClass("role");
						}
					}
				}
				$("#nextCue").html("<h5>End of Show</h5>");
			} else {
				var prevLine = document.createElement("h5");
				$(prevLine).html(this.blocking[this.show.blockingIndex-1].cueLine);
				var prevDirect = document.createElement("h6");
				$(prevDirect).html(this.blocking[this.show.blockingIndex-1].directions);
				$("#prevCue").append(prevLine);
				$("#prevCue").append(prevDirect);
				for(ch in this.blocking[this.show.blockingIndex-1].characters){
					$("#prevCue").append("<p>"+this.blocking[this.show.blockingIndex-1].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
						if(this.blocking[this.show.blockingIndex-1].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
							$(prevLine).addClass("role");
						}
					}
				}
				var currLine = document.createElement("h5");
				$(currLine).html(this.blocking[this.show.blockingIndex].cueLine);
				var currDirect = document.createElement("h6");
				$(currDirect).html(this.blocking[this.show.blockingIndex].directions);
				$("#currentCue").append(currLine);
				$("#currentCue").append(currDirect);
				for(ch in this.blocking[this.show.blockingIndex].characters){
					$("#currentCue").append("<p>"+this.blocking[this.show.blockingIndex].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
						if(this.blocking[this.show.blockingIndex].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
							$(currLine).addClass("role");
						}
					}
				}
				var nextLine = document.createElement("h5");
				$(nextLine).html(this.blocking[this.show.blockingIndex + 1].cueLine);
				var nextDirect = document.createElement("h6");
				$(nextDirect).html(this.blocking[this.show.blockingIndex + 1].directions);
				$("#nextCue").append(nextLine);
				$("#nextCue").append(nextDirect);
				for(ch in this.blocking[this.show.blockingIndex + 1].characters){
					$("#nextCue").append("<p>"+this.blocking[this.show.blockingIndex + 1].characters[ch]+"</p>");
					for(var r = 0; r < this.user.roles[this.show.showName].length; r++){
						if(this.blocking[this.show.blockingIndex+1].characters.indexOf(this.user.roles[this.show.showName][r]) != -1){
							$(nextLine).addClass("role");
						}
					}
				}
			}
		}
	};
	
	this.advanceCue = function(){
		if(this.show.blockingIndex < this.blocking.length-1){
			this.show.blockingIndex++;
		}
		$("#prevCue").empty();
		$("#currentCue").empty();
		$("#nextCue").empty();
		this.loadCues();
	};
	
	this.backCue = function(){
		if(this.show.blockingIndex > 0){
			this.show.blockingIndex--;
		}
		$("#prevCue").empty();
		$("#currentCue").empty();
		$("#nextCue").empty();
		this.loadCues();
	};
	
	this.loadCues();
	
	
	$("#cueToCueButton").click(function(){
		$("#container").toggle();
		$("#cueToCue").toggle();	
	});
	
	$("#return").click(function(){
		$("#container").toggle();
		$("#cueToCue").toggle();
	});
	
	$("#nextCueButton").click(function(){
		window.advanceCue();
	});
	
	$("#prevCueButton").click(function(){
		window.backCue();
	});
	
	$("#cancelButton").click(function(){
		window.location = "home.html?usr="+getObj.usr+"&key="+getObj.key;
	});
	
	this.socket.on("updateCue", function(data){
		if(data.showId == getObj.show && data.sender != getObj.usr){
			window.show.blockingIndex = data.cueIndex;
			$("#prevCue").empty();
			$("#currentCue").empty();
			$("#nextCue").empty();
			window.loadCues();
		}
	});
	
	this.socket.on("updateShow", function(data){
		if(data.showId == getObj.show && data.sender != getObj.usr){
		
			var oldIndex = window.show.blockingIndex;
			
			$.ajax({
				async : false,
				url : "/loadShowEdit",
				type : "POST",
				data : {
					"id" : getObj.show,
					"usrId" : window.user.id
				},
				success : function(data){
					window.show = new Show(data);
					
				}
			});
			
			window.show.blockingIndex = oldIndex;
			
			$("#prevCue").empty();
			$("#currentCue").empty();
			$("#nextCue").empty();
			window.loadCues();
			
			$("#title").html(window.show.showName);
			$("#characters").empty();
			$("#blocking").empty();
			if(window.show.characters){
				window.listCharacters();
			}
			if(window.show.blocking){
				for(var z = 0; z < window.show.blocking.length; z++){
					var currBlock = window.show.blocking[z];
					window.addBlocking(currBlock.characters, currBlock.directions, currBlock.cueLine, z);
				}
			}
		}
	});
	
	$("#hideShowChars").click(function(){
		$("#characters").slideToggle("slow");
	});
	
	$("#hideShowBlocking").click(function(){
		$("#blocking").slideToggle("slow");
	});
}();