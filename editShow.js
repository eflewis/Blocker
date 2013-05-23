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
		console.log(charLis);
	};
	
	this.addShow = function(){
		alert("adding show");
		var showName = $("#showName").val();
		var characters = this.characters;
		var blocking = this.blocking;
		var viewPermissions = new Array();
		viewPermissions.push(this.user.id);
		var writePermissions = new Array();
		writePermissions.push(this.user.id);
		var showData =  {
				"showName" : showName,
				"characters" : characters,
				"blocking" : blocking,
				"viewPermissions" : viewPermissions,
				"writePermissions" : writePermissions
			};
		
		$.ajax({
			url : "/addShow",
			type : "POST",
			data : {
				"insert" : showData,
				"user" : window.user.id
				},
			success : function(data){
				window.location = "editShow.html?usr="+getObj.usr+"&key="+getObj.key+"&fun=edit&show="+data.show;
			}
		});	
	};
	
	this.saveShow = function(){
		$("#prevCue").empty();
		$("#currentCue").empty();
		$("#nextCue").empty();
		window.loadCues();
		var showName = this.show.showName;
		var characters = this.characters;
		var blocking = this.blocking;
		var showData =  {
				"showName" : showName,
				"characters" : characters,
				"blocking" : blocking
			};
		$.ajax({
			url : "/saveShow",
			type : "POST",
			data : {
				"id" : getObj.show,
				"showData" : showData
			},
			success : function(data){
				window.socket.emit("showUpdated", {"showId" : getObj.show, "sender" : getObj.usr});
				$("#prevCue").empty();
				$("#currentCue").empty();
				$("#nextCue").empty();
				window.loadCues();
				//window.location = "editShow.html?usr="+getObj.usr+"&key="+getObj.key+"&fun=edit&show="+data.show;
			}
		});
	};
	
	this.addChar = function(name){
		var newCharName = name;
		this.characters.push(newCharName);
		
		console.log(this.characters);
		
		var newLi = document.createElement("li");
		newLi.innerHTML = newCharName;
		newLi.id = newCharName.replace(/\s|\?|'|!|,|"/g, "") + "Li";
		var deleteDiv = document.createElement("div");
		deleteDiv.innerHTML = "X";
		deleteDiv.addEventListener("click", function(){$("#" + newCharName.replace(/\s|\?|'|!|,|"/g, "") + "Li").remove();
			var resArray = [];
			for(var m = 0; m < window.characters.length; m++){
				if(window.characters[m] != newCharName){
					resArray.push(window.characters[m]);
				}
			}
			window.characters = resArray;
			$("#"+newCharName.replace(/\s|\?|'|!|,|"/g, "")).remove();
			window.saveShow();
		});
		$(newLi).append(deleteDiv);
		$("#characters").append(newLi);
		
		var newDiv = document.createElement("div");
		newDiv.id = newCharName.replace(/\s|\?|'|!|,|"/g, "");
		newDiv.className = "unselected";
		newDiv.innerHTML = "<p>"+newCharName+"</p>";
		newDiv.addEventListener("click", function(e){
			if(e.target.parentNode.className == "unselected"){
				e.target.parentNode.className = "selected";
			} else {
				e.target.parentNode.className = "unselected";
			}
		});
		$("#charsForBlocking").append(newDiv);
	};
	
	this.listCharacters = function(){
		for(var j = 0;j < this.show.characters.length; j++){
			this.addChar(this.show.characters[j]);
		}
	};
	
	this.insertCue = function(ind, insDiv){
		var cueId = this.blocking[ind].cueLine.replace(/\s|\?|'|!|,|"/g, "");
		
		var insLineIn = document.createElement("input");
		insLineIn.type = "text";
		insLineIn.id = cueId+"CueLine";
		$(insLineIn).addClass("textInput");
		$(insLineIn).val("cue line");
		
		var insDirIn = document.createElement("input");
		insDirIn.type = "text";
		insDirIn.Id = cueId+"CueDirections";
		$(insDirIn).addClass("textInput");
		$(insDirIn).val("directions");
		
		var charsDiv = document.createElement("div");
		for(charName in this.characters){
			var charDiv = document.createElement("div");
			charDiv.id = this.characters[charName].replace(/\s|\?|'|!|,|"/g, "");
			charDiv.className = "unselectedIns";
			charDiv.innerHTML = "<p>"+this.characters[charName]+"</p>";
			charDiv.addEventListener("click", function(e){
				if(e.target.parentNode.className == "unselectedIns"){
					e.target.parentNode.className = "selectedIns";
				} else {
					e.target.parentNode.className = "unselectedIns";
				}
			});
		$(charsDiv).append(charDiv);
		}
		
		var saveDiv = document.createElement("div");
		$(saveDiv).html("<h6 class='saveButton'>Add</h6>");
		$(saveDiv).click(function(){
			var cue = $(insLineIn).val();
			var directions = $(insDirIn).val();

			var charsForCue = $(".selectedIns");
			var chs = [];
			for(var x = 0; x < charsForCue.length; x++){
				chs.push(charsForCue[x].firstChild.innerHTML);
			}
			var data = {
				"cue" : cue,
				"directions" : directions,
				"characters" : chs
			};
			
			var newBlock = new BlockPoint(data);
			window.blocking.splice(ind+1, 0, newBlock);
			
			$("#blocking").empty();
			
			var oldBlocking = window.blocking;
			window.blocking = [];
			for(var f = 0; f < oldBlocking.length; f++){
				var currBlock = oldBlocking[f];
				window.addBlocking(currBlock.characters, currBlock.directions, currBlock.cueLine, f);
			}
			window.saveShow();
		});
		
		
		$(insDiv).append(insLineIn);
		$(insDiv).append(insDirIn);
		$(insDiv).append(charsDiv);
		$(insDiv).append(saveDiv);
	}
	
	this.editCue = function(index, editDiv){
		var cueId = this.blocking[index].cueLine.replace(/\s|\?|'|!|,|"/g, "");
		console.log(cueId);
		console.log(this.blocking[index].cueLine);
		
		var newLineIn = document.createElement("input");
		newLineIn.type = "text";
		newLineIn.id = cueId+"EditLine";
		$(newLineIn).addClass("textInput");
		$(newLineIn).val(window.blocking[index].cueLine);
		
		var newDirIn = document.createElement("input");
		newDirIn.type = "text";
		newDirIn.Id = cueId+"EditDirections";
		$(newDirIn).addClass("textInput");
		$(newDirIn).val(window.blocking[index].directions);
		
		var charsDiv = document.createElement("div");
		for(charName in this.characters){
			var charDiv = document.createElement("div");
			charDiv.id = this.characters[charName].replace(/\s|\?|'|!|,|"/g, "");

			charDiv.className = "unselectedEdit";
			charDiv.innerHTML = "<p>"+this.characters[charName]+"</p>";
			charDiv.addEventListener("click", function(e){
				if(e.target.parentNode.className == "unselectedEdit"){
					e.target.parentNode.className = "selectedEdit";
				} else {
					e.target.parentNode.className = "unselectedEdit";
				}
			});
		$(charsDiv).append(charDiv);
		}
		
		var saveDiv = document.createElement("div");
		$(saveDiv).html("<h6 class='saveButton'>Save Changes</h6>");
		$(saveDiv).click(function(){
			var charsForCue = $(".selectedEdit");
			var chs = [];
			for(var x = 0; x < charsForCue.length; x++){
				chs.push(charsForCue[x].firstChild.innerHTML);
			}
			window.blocking[index].characters = chs;
			window.blocking[index].cueLine = $(newLineIn).val();
			window.blocking[index].directions = $(newDirIn).val();
			$("#blocking").empty();
			
			var oldBlocking = window.blocking;
			window.blocking = [];
			for(var q = 0; q < oldBlocking.length; q++){
				var currBlock = oldBlocking[q];
				window.addBlocking(currBlock.characters, currBlock.directions, currBlock.cueLine, q);
			}
			window.saveShow();
		});
		$(editDiv).append(newLineIn);
		$(editDiv).append(newDirIn);
		$(editDiv).append(charsDiv);
		$(editDiv).append(saveDiv);
	}
	
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
		
		var editDiv = document.createElement("div");
		var heading = document.createElement("h6");
		$(heading).html("Edit Cue");
		$(heading).click(function(){
			if($(editDiv).children("input").length > 0){
				$(editDiv).empty();
			} else {
				var cueIndex = window.blocking.indexOf(newBlock);
				window.editCue(cueIndex, editDiv);
			}
		});
		$(newLi).append(heading);
		$(newLi).append(editDiv);
		
		var insertDiv = document.createElement("div");
		var head = document.createElement("h6");
		$(head).html("Insert Cue");
		$(head).addClass("insertButton");
		$(head).click(function(){
			if($(insertDiv).children("input").length > 0){
				$(insertDiv).empty();
			} else {
				var cueIndex = window.blocking.indexOf(newBlock);
				window.insertCue(cueIndex, insertDiv);
			}
		});
		$(newLi).append(head);
		$(newLi).append(insertDiv);
		
		var deleteDiv = document.createElement("div");
		deleteDiv.innerHTML = "X";
		$(deleteDiv).addClass("delete");
		deleteDiv.addEventListener("click", function(){
			$(newLi).remove();
			var newBlocking = [];
			for(block in window.blocking){
				if(window.blocking[block].cueLine != newBlock.cueLine){
					newBlocking.push(window.blocking[block]);
				}
			}
			window.blocking = newBlocking;
			window.saveShow();
		});
		$(newLi).append(deleteDiv);
		$(newH5).click(function(){$(newDiv).slideToggle("slow")});
		$(newDiv).hide();
		$("#blocking").append(newLi);
		$("#blockLine").val("");
		$("#blockDesc").val("");
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
	
	$("#cueToCue").hide();
	
	var userCheck = validUser(getObj.usr, getObj.key);
	if(userCheck){
		this.user = userCheck;
	} else {
		window.location = "login.html";
	}
	
	if(getObj.fun == "add"){
		$("#saveButton").click(function(){window.addShow();});
	} else if(getObj.fun == "edit"){
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
		if(this.show.editPermissions.indexOf(this.user.id.toString()) === -1){
			window.location = "viewShow.html?usr="+getObj.usr+"&key="+getObj.key+"&fun=edit&show="+getObj.show;
		}
		$("#showName").val(this.show.showName);
		$("#title").html(this.show.showName);
		if(this.show.characters){
			this.listCharacters();
		}
		if(this.show.blocking){
			for(var u = 0; u < this.show.blocking.length; u++){
				var currBlock = this.show.blocking[u];
				this.addBlocking(currBlock.characters, currBlock.directions, currBlock.cueLine, u);
			}
		}
		$("#skipList").hide();
		$("#showSkipList").click(function(){$("#skipList").slideToggle("fast")});
		$("#saveButton").click(function(){window.saveShow();});
	}
	
	this.loadCues = function(){
		console.log(this.show.blockingIndex + 1);
		console.log(this.blocking);
		console.log(this.blocking[this.show.blockingIndex + 1])
		console.log(this.blocking[3]);
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
				}
				var currLine = document.createElement("h5");
				$(currLine).html(this.blocking[this.show.blockingIndex].cueLine);
				var currDirect = document.createElement("h6");
				$(currDirect).html(this.blocking[this.show.blockingIndex].directions);
				$("#currentCue").append(currLine);
				$("#currentCue").append(currDirect);
				for(ch in this.blocking[this.show.blockingIndex].characters){
					$("#currentCue").append("<p>"+this.blocking[this.show.blockingIndex].characters[ch]+"</p>");
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
				}
				var currLine = document.createElement("h5");
				$(currLine).html(this.blocking[this.show.blockingIndex].cueLine);
				var currDirect = document.createElement("h6");
				$(currDirect).html(this.blocking[this.show.blockingIndex].directions);
				$("#currentCue").append(currLine);
				$("#currentCue").append(currDirect);
				for(ch in this.blocking[this.show.blockingIndex].characters){
					$("#currentCue").append("<p>"+this.blocking[this.show.blockingIndex].characters[ch]+"</p>");
				}
				var nextLine = document.createElement("h5");
				$(nextLine).html(this.blocking[this.show.blockingIndex + 1].cueLine);
				var nextDirect = document.createElement("h6");
				$(nextDirect).html(this.blocking[this.show.blockingIndex + 1].directions);
				$("#nextCue").append(nextLine);
				$("#nextCue").append(nextDirect);
				for(ch in this.blocking[this.show.blockingIndex + 1].characters){
					$("#nextCue").append("<p>"+this.blocking[this.show.blockingIndex + 1].characters[ch]+"</p>");
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
	
	$("#addCharButt").click(function(){window.addChar($("#charName").val());
		$("#charName").val("");
		window.saveShow();
	});
	
	$("#addBlockButton").click(function(e){
		var charsForCue = $(".selected");
		var chs = [];
		for(var t = 0; t < charsForCue.length; t++){
			chs.push(charsForCue[t].firstChild.innerHTML);
		}
		window.addBlocking(chs, $("#blockDesc").val() ,$("#blockLine").val(), window.blocking.length);
		window.saveShow();
	});
	
	$("#writeAccess").click(function(){
		$.ajax({
			url : "/grantAccess",
			type : "POST",
			data : {
				"accessType" : "write",
				"user" : $("#newUser").val(),
				"showId" : getObj.show
			},
			success : function(data){
				if(data.err){
					$("addMessage").html(data.err);
					console.log(data.err);
				} else {
					window.saveShow();
				}
			}
		});
	});
	
	$("#viewAccess").click(function(){
		$.ajax({
			url : "/grantAccess",
			type : "POST",
			data : {
				"accessType" : "view",
				"user" : $("#newUser").val(),
				"showId" : getObj.show
			},
			success : function(data){
				if(data.err){
					$("addMessage").html(data.err);
					console.log(data.err);
				} else {
					window.saveShow();
				}
			}
		});
	});
	
	$("#cancelButton").click(function(){
		window.location = "home.html?usr="+getObj.usr+"&key="+getObj.key;
	});
	
	$("#cueToCueButton").click(function(){
		$("#container").toggle();
		$("#cueToCue").toggle();
		
	});
	
	$("#nextCueButton").click(function(){
		window.advanceCue();
		window.socket.emit("cueChanged", {"showId" : getObj.show, "sender" : getObj.usr, "cueIndex" : window.show.blockingIndex});
	});
	
	$("#prevCueButton").click(function(){
		window.backCue();
		window.socket.emit("cueChanged", {"showId" : getObj.show, "sender" : getObj.usr, "cueIndex" : window.show.blockingIndex});
	});
	
	$("#return").click(function(){
		$("#container").toggle();
		$("#cueToCue").toggle();
	});
	
	$("#hideShowChars").click(function(){
		$("#characters").slideToggle("slow");
	});
	
	$("#hideShowBlocking").click(function(){
		$("#blocking").slideToggle("slow");
	});
}();