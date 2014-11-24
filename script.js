window.onload = function() {

	var submit = document.getElementById('submit'),
			chatbox = document.getElementById('chatbox'),
			textInput = document.getElementById('text'),
			welcomeUser = document.getElementById('user'),
			milliseconds = (new Date).getTime(),
			chatroom = new ChatroomApi("SECRET_KEY"),
			setTime = milliseconds,
			user = '',
			currentUser = false,
			re = /^[0-9a-zA-Z]{4,20}$/;

// GET USERNAME
	var userPromt = function() {
		var entry = prompt("Enter A Username, 20 Characters Max!");
		match = re.exec(entry);
		if (!match || entry === null) {
			userPromt();
		} else {
			user = entry;
			chatroom.api("sendMessage",[entry, 'has joined the room '], function(res) {
				if (res) {
					chatbox.scrollTop = chatbox.scrollHeight;
				} else {
					appendMessage("Error!");
				}
			});
		}
	};
	userPromt();

// APPENDING MESSAGES
	var appendMessage = function(message, currentUser) {
		var newMessage = document.createElement('h3');
  	var content = document.createTextNode(message);
 		newMessage.appendChild(content);
		if (currentUser === false) {
 			chatbox.appendChild(newMessage);
		} else {
			newMessage.style.color = 'white';
 			chatbox.appendChild(newMessage);
		}
	};

// CHECK FOR OLD MESSAGES
	var checkForMessages = function() {
		chatroom.api("getMessagesBefore",[setTime, 10], function(res) {
			if (res){
				setTime = res[9].time;
				revRes = res.reverse();
				for (i in revRes) {
					currentUser = checkUser(res[i].user);
					appendMessage(res[i].user + ': ' + res[i].content, currentUser);
				}
				rapidCheck(res[9].id);
				chatbox.scrollTop = chatbox.scrollHeight;
			} else {
				appendMessage("Sorry, could not load old messages!");
			}
		});
	};
	checkForMessages();

// CHECK FOR NEW MESSAGES
	var rapidCheck = function(oldId) {
		chatroom.api("getMessagesBefore",[milliseconds, 1], function(res) {
			if (res){
				if (res[0].id !== oldId){
					currentUser = checkUser(res[0].user);
					appendMessage(res[0].user + ': ' + res[0].content, currentUser);
					setInterval(rapidCheck(res[0].id), 1000);
				} else {
					setInterval(rapidCheck(res[0].id), 1000);
				}
			}
		});
	};

// SUBMIT MESSAGE
	var submitMessage = function(message) {
		var content = textInput.value;
			chatroom.api("sendMessage",[user, content], function(res) {
				if (res) {
					textInput.value = "";
					chatbox.scrollTop = chatbox.scrollHeight;
				} else {
					appendMessage("Error!");
				}
			});
	};

// SUBMIT NEW MESSAGE
	submit.onclick = function() {
    submitMessage();
	};

// GET MORE MESSAGES ON SCROLL UP
	chatbox.onscroll = function(e) {
		if (chatbox.scrollTop <= 2) {
			chatroom.api("getMessagesBefore",[setTime, 1], function(res) {
				if (res) {
					setTime = res[0].time;
					currentUser = checkUser(res[0].user);
					var newMessage = document.createElement('h3');
					var content = document.createTextNode(res[0].user + ': ' + res[0].content);
			 		newMessage.appendChild(content);
	 				if (currentUser === false) {
						chatbox.insertBefore(newMessage,chatbox.firstChild);
					} else {
						newMessage.style.color = 'white';
						chatbox.insertBefore(newMessage,chatbox.firstChild);
			 		}
				} else {
					appendMessage("Could not load old messages!");
				}
			});
		}
	};

// SHIFT RETURN
	document.onkeydown = function(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
    	submitMessage();
    }
	};

// CHECKS IF MESSAGE IS FROM CURRENT USER
	var checkUser = function(postUser) {
		return currentUser = (postUser === user) ? true : false;
	};

// // TEST OTHER USERS
// 	var fakeUser = function() {
// 		chatroom.api("sendMessage",['fakeUser', 'A/S/L?'], function(res) {
// 			if (res) {
// 				setInterval(fakeUser, 5000);
// 				chatbox.scrollTop = chatbox.scrollHeight;
// 			}
// 		});
// 	};

// 	fakeUser();

};