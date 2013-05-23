var socket = io.connect('http://localhost:3000/');

function processLogin(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var data = {
		username : username,
		password : password
	};
	socket.emit("login", data);
	document.getElementById("username").value = "";
	document.getElementById("password").value = "";
}

function processRegistration(){
	var username = document.getElementById("regUser").value;
	var password = document.getElementById("regPassword").value;
	var data = {
		username : username,
		password : password,
		showIdList : []
	};
	socket.emit("register", data);
	document.getElementById("regUser").value = "";
	document.getElementById("regPassword").value = "";
}

socket.on("loginSuccess", function(data){
	console.log(data);
	$.ajax({
		url : "/login",
		type : "POST",
		data : {"username" : data.username,
				"permissions" : JSON.stringify(data.permissions),
				"shows" : JSON.stringify(data.shows)
				},
		success : function(returnData){
					window.location = "/home";
				}
	});
})

socket.on("regFail", function(data){
	document.getElementById("message").innerHTML = data.message;
});


document.getElementById("submit").addEventListener("click", processLogin);
document.getElementById("regSubmit").addEventListener("click", processRegistration);