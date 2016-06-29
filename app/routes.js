module.exports = function (app, streams) {
	var User = require('./model/user');
	var Friend = require('./model/friend');
	console.log('cOME TO ROUTES ');
	// GET home
	var index = function (req, res) {
		res.render('index', {
			title : 'Project RTC',
			header : 'WebRTC live streaming',
			username : 'Username',
			share : 'Share this link',
			footer : 'pierre@chabardes.net',
			id : req.params.id
		});
	};

	// POST check login info
	var login = function (req, res) {
		console.log("come here");
		User.findOne({
			username : req.body.username
		}, function (err, user) {
			if (!user) {
				res.send({
					status : -1
				});
			} else {
				// test a matching password
				if (user.comparePassword(req.body.password) == 1) {
					res.send({
						status : 1,
						id : user.id,
						name : user.username
					});
					// Friend.findOne({ username: req.body.username }, function(err, friend) {
					//   if (!friend){
					//     res.send({status: 1,id: user.id});
					//   }else{
					//     res.send({status: 1,id: user.id,id: friend.friend_id});
					//   }
					// });
					//??? return id to user
					//return list of friends id and status online offline
				} else {
					res.send({
						status : -1
					});
				}
			}
		});
	};

	//GET list of users
	var listUser = function (req, res) {
		var id = req.params.id;
		Friend.find({
			'username' : id
		}, function (err, friends) {
			var ids = friends.map(function (friend) {
					return friend.friend_id;
				});
			User.find({
				id : {
					$ne : ids
				}
			}, function (err, users) {
				if (err) {
					res.send({
						status : -1
					});
				} else {
					res.json(users);
				}
			});
		});

		// User.find(function(err, users) {
		//   if (err){
		//     res.send({status: -1});
		//   }else{
		//     res.json(users);
		//   }
		// });
	};

	var listFriend = function (req, res) {
		Friend.find({
			'username' : req.body.username
		}, function (err, friends) {
			if (err) {
				res.send({
					status : -1
				});
			} else {
				res.json(friends);
			}
		});
	};

	var getPersonName = function (req, res) {
		User.findOne({
			id : req.body.username
		}, function (err, user) {
			if (err) {
				res.send({
					status : -1
				});
			} else {
				res.json(user);
			}
		});
	};

	//POST add friend
	var addFriend = function (req, res) {
		var username = req.body.username;
		var friend_id = req.body.friend_id;
		var newFriend = Friend({
				username : username,
				friend_id : friend_id
			});
		newFriend.save(function (err) {
			if (err) {
				res.send(err);
			} else {
				var newFriend_reverse = Friend({
						username : friend_id,
						friend_id : username
					});
				newFriend_reverse.save(function (err) {
					if (err) {
						res.send(err);
					} else {
						res.send({
							status : 1
						});
					}
				});
			}
		});

	};

	// POST register user account
	var register = function (req, res) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		//remember to check trung id trong db
		var newUser = User({
				name : req.body.name,
				username : req.body.username,
				password : req.body.password,
				email : req.body.email,
				phone : req.body.phone,
				id : text
			});
		console.log("come here: " + req.body.name);
		newUser.save(function (err) {
			if (err) {
				console.log(err);
				res.send({
					status : -1
				});
			} else {
				console.log("Khong co loi");
				res.send({
					status : 1,
					id : text
				});
			}

		});
	};

	//POST get my phone
	var getMyPhone = function (req, res) {
		var phoneNew = "0";
		var possible = "0123456789";
		for (var i = 0; i < 8; i++)
			phoneNew += possible.charAt(Math.floor(Math.random() * possible.length));
		//Trung phone
		User.findOne({
			id : req.body.id
		}, function (err, user) {
			if (!user) {
				var newUser = User({
						name : req.body.name,
						username : req.body.username,
						password : req.body.password,
						email : req.body.email,
						phone : phoneNew,
						id : request.body.id
					});

				newUser.save(function (err) {
					if (err) {
						console.log(err);
						res.send({
							status : -1
						});
					} else {
						res.send({
							status : 1,
							id : newUser.id,
							phone : phoneNew
						});
					}

				});
			} else {
				res.send({
					status : 1,
					id : user.id,
					phone : user.phone
				});
			}
		});

	};

	//POST get friend phone
	var getFriendPhone = function (req, res) {

		User.findOne({
			phone : req.body.phone
		}, function (err, user) {
			if (!user) {

				res.send({
					status : -1,
					phone : ""
				});

			} else {
				res.send({
					status : 1,
					id : user.id,
					phone : user.id
				});
			}
		});

	};

	// GET streams as JSON
	var displayStreams = function (req, res) {
		var streamList = streams.getStreams();
		// JSON exploit to clone streamList.public
		var data = (JSON.parse(JSON.stringify(streamList)));
		res.status(200).json(data);
	};

	app.get('/streams.json', displayStreams);
	app.get('/users/:id', listUser);

	app.post('/friend_name', getPersonName);
	app.post('/friends', listFriend);
	app.post('/login', login);
	app.post('/addFriend', addFriend);
	app.post('/register', register);
	app.get('/', index);
	app.post('/my_phone', getMyPhone);
	app.post('/friend_phone', getFriendPhone);
	app.get('/:id', index);
}
