/** SERVER.JS FOR MEMBER WEBSITE API **/

var express = require('express');
var app = express();
var jwt = require('express-jwt');
var favicon = require('serve-favicon');
var jwks = require('jwks-rsa');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
var cors = require('cors');
var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
var parser = require('body-parser');
mongoose.Promise = require("bluebird");
const QUERY_SIZE = 2000;

const PORT = 9090;

var serverOptions = {
	'auto_reconnect': true,
	'poolSize': 5,
	'server': {
		'socketOptions': {
			'keepAlive': 1000,
			'connectTimeoutMS': 5000
		}
	}
};

var connection = mongoose.createConnection("mongodb://localhost:27017/KUTz-World", serverOptions);

connection.on('error', console.error.bind(console, 'error connecting with mongodb database:'));

connection.once('open', function () {
	console.log('connected to mongodb database');
	app.listen(PORT);
});

connection.on('disconnected', function () {
	//Reconnect on timeout
	connection = mongoose.createConnection("mongodb://localhost:27017/KUTz-World", serverOptions);
});


/*var connection = connectToDatabase().on('error', console.error.bind(console, 'connection error:'))
	.on('disconnected', connectToDatabase).once('open', () => app.listen(PORT));*/
/*
//===================Create Mongoose Schema =====================//
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});

// Get model
var Todo = mongoose.model('Todo', userSchema); */

console.log(rsaValidation());
/*
var jwtCheck = jwt({
	secret: rsaValidation(),
	audience: 'http://touch-mobileapp.com',
	issuer: "https://touch-mobileapp.auth0.com/",
	algorithms: ['RS256']
}); */

var jwtCheck = jwt({
	secret: jwks.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 15,
		jwksUri: "https://kuts-world.auth0.com/.well-known/jwks.json"
	}),
	audience: "https://KUTS-World-Member-API",
	issuer: "https://kuts-world.auth0.com/",
	algorithms: ['RS256']
});

app.use(parser.json());
app.use(parser.urlencoded({
	extended: true
}));
app.use(cors());
/*
var jwtCheck = jwt({
	secret: jwks.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: "https://touch-mobileapp.auth0.com/.well-known/jwks.json"
	}),
	audience: 'http://localhost:3000',
	issuer: "https://touch-mobileapp.auth0.com/",
	algorithms: ['RS256']
}); */

// Guard API endpoints
var guard = function (req, res, next) {
		switch (req.path) {


			case '/api/submit-video':
				{
					var permissions = ['General'];
					for (var i = 0; i < permissions.length; i++) {
						if (req.user.scope.includes(permissions[i])) {
							next();
						} else {
							res.send(403, {
								message: 'Forbidden'
							});
						}
					}
					break;
				}

			case '/api/submit-image':
				{
					var permissions = ['General'];
					for (var i = 0; i < permissions.length; i++) {
						if (req.user.scope.includes(permissions[i])) {
							next();
						} else {
							res.send(403, {
								message: 'Forbidden'
							});
						}
					}
					break;
				}

			case '/api/createApplication':
				{
					var permissions = ['General'];
					for (var i = 0; i < permissions.length; i++) {
						if (req.user.scope.includes(permissions[i])) {
							next();
						} else {
							res.send(403, {
								message: 'Forbidden'
							});
						}
					}
					break;
				}
			case '/adminapi/getApplications':
				{
					var permissions = ['Admin'];
					for (var i = 0; i < permissions.length; i++) {
						if (req.user.scope.includes(permissions[i])) {
							next();
						} else {
							console.log("SMH BRUH");
							res.send(403, {
								message: 'Forbidden'
							});
						}
					}
					break;
				}

			case '/adminapi/deleteApplication/:todo_id':
				{
					var permissions = ['Admin'];
					for (var i = 0; i < permissions.length; i++) {
						if (req.user.scope.includes(permissions[i])) {
							next();
						} else {
							res.send(403, {
								message: 'Forbidden'
							});
						}
					}
					break;
				}
		}
	}
	//app.use('/adminapi', jwtCheck);
	//app.use('/api', jwtCheck);
app.use(jwtCheck);
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({
			message: 'Missing or invalid token'
		});
	}
});
//app.use(guard);

var privacyTypes = {
	public: 'Public',
	private: 'Private',
	friends_only: 'Friends only'
};
var albumTypes = {
	thumbnail: 'Display',
	banner: 'Banners',
	other: 'Other'
};

var VideoSubmission = connection.model('FanVideo', {
	video: [{}],
	caption: String,
	email: String,
	additionalInfo: String,
	accepted: Boolean,
	submitted_at: Date
});

var ImageSubmission = connection.model('FanImage', {
	images: [{}],
	caption: String,
	email: String,
	additionalInfo: String,
	accepted: Boolean,
	submitted_at: Date
});

var VideoPost = connection.model('adminvideoposts', {
	url: String,
	size: Number,
	mimeType: String,
	caption: String,
	title: String,
	additionalComments: String,
	isNSFW: Boolean,
	accepted: Boolean,
	posted_at: Date,
	updated_at: Date,
	adminID: String,
	adminNickname: String
});

var Geometries = new mongoose.Schema({
	'type': String,
	'coordinates': [Number]
});

var GeometrySchema = new mongoose.Schema({
	type: String,
	geometries: [Geometries]
});

var GEOPoint = connection.model('populated_geo_points', GeometrySchema);


/*var LocationSchema = new mongoose.Schema({
	name: String,
	location: {
		coordinates: [Number],
		type: {
			type: String,
			default: 'Point'
		}
	}
});*/

/*LocationSchema.index({
	'location': '2dsphere'
});*/

var CountrySchema = new mongoose.Schema({
	name: String,
	countryCode: String
});

CountrySchema.index({
	countryCode: 1
});

var ProfileSchema = new mongoose.Schema({
	uid: {
		type: String,
		unique: true,
		required: true
	},
	username: String,
	tagline: String,
	email: String,
	brand: String,
	profession: String,
	biography: String,
	DOB: Date,
	thumbnail: [{}],
	banner: [{}],
	gallery: [{}],
	city: String,
	state: String,
	postalcode: String,
	location: {
		coordinates: [Number],
		type: {
			type: String,
			default: 'Point'
		}
	},
	anchorPoints: [{
		coordinates: [Number],
		type: {
			type: String,
			default: 'Point'
		}
	}],
	country: CountrySchema,
	interests: [String],
	headline: String,
	isProfileComplete: Boolean,
	isProfileVerified: Boolean,
	member_since: Date,
	last_online: Date
});

ProfileSchema.index({
	interests: 1
});

ProfileSchema.index({
	'location': '2dsphere'
}, {
	background: true
});

var Profile = connection.model('profile', ProfileSchema);

Profile.on('index', function (err) {
	if (err) {
		console.log('error building indexes: ' + err);
	}
});


/*var GallerySchema = new mongoose.Schema({
	uid: {
		type: String,
		unique: true
	}
});


var Gallery = connection.model('gallery', GallerySchema); */

var AlbumSchema = new mongoose.Schema({
	owner_id: {
		type: mongoose.Schema.Types.ObjectId,
		unique: false
	},
	name: String,
	albumType: String,
	privacyType: {
		type: String,
		default: privacyTypes.public
	},
	created_at: Date,
	priority: Number
});

AlbumSchema.index({
	owner_id: 1,
	priority: 1,
	created_at: -1
})

var Album = connection.model('album', AlbumSchema);

Album.on('index', function (err) {
	if (err) {
		console.log('error building indexes: ' + err);
	}
});

var MediaSchema = new mongoose.Schema({
	owner_id: {
		type: mongoose.Schema.Types.ObjectId,
		unique: false
	},
	album_id: {
		type: mongoose.Schema.Types.ObjectId,
		unique: false
	},
	filestack: {},
	google_storage: {},
	posted_at: Date
});

MediaSchema.index({
	album_id: 1,
	posted_at: -1
})

var Media = connection.model('media', MediaSchema);

Media.on('index', function (err) {
	if (err) {
		console.log('error building indexes: ' + err);
	}
});


app.get('/member-api/get-profile', function (req, res) {

	console.log('get-profile API endpoint called!!!');
	console.log(req.query);
	Profile.findOne({
		uid: req.query.UID
	}, function (err, profile) {
		if (err) {
			console.log(err);
			res.status(500).send(null);
		} else if (!profile) {
			console.log('No profile matching ' + req.query.UID + ' found!');
			res.status(404).send([]);
		} else {
			res.status(200).send(profile);
		}
	});
});

app.get('/member-api/get-users', function (req, res) {
	console.log('\n======================================');
	console.log('get-users API endpoint called!!!');
	console.log(req.query);
	var authArray = req.query.authIDArray;
	var idArray = [];
	var locationData = JSON.parse(req.query.location);
	if (authArray && Array.isArray(authArray)) {
		console.log(authArray);
		//var parsedArray = JSON.parse(req.query.authIDArray);
		//console.log(parsedArray);
		for (var i = 0; i < authArray.length; i++) {
			idArray.push(JSON.parse(authArray[i]).$id);
		}
		console.log(idArray);
	} else if (authArray) {
		parsedObj = JSON.parse(authArray);
		if (parsedObj.$id) {
			idArray.push(parsedObj.$id);
		}
	}
	if (idArray.length > 0 && locationData) {
		var cursor1 = connection.db.collection('profiles').aggregate([{
			$geoNear: {
				"near": {
					type: "Point",
					coordinates: locationData.coordinates
				},
				"spherical": true,
				"distanceField": "distance",
				"distanceMuliplier": 0.001 //<----- convert km to miles
			}
		}, {
			$match: {
				"uid": {
					$in: idArray
				}
			}
		}, {
			$sort: {
				"distance": 1
			}
		}]);
		/*, {
					"$geoNear": {
						"near": {
							type: "Point",
							coordinates: locationData.coordinates
						},
						"spherical": true,
						"distanceField": "distance",
						"distanceMuliplier": 0.001
					}
				}*/

		var cursor2 = connection.db.collection('profiles').aggregate([{
			$geoNear: {
				"near": {
					type: "Point",
					coordinates: locationData.coordinates
				},
				"spherical": true,
				"distanceField": "distance",
				"distanceMuliplier": 0.001 //<----- convert km to miles
			}
		}, {
			$match: {
				"uid": {
					$nin: idArray
				}
			}
		}, {
			$sort: {
				"last_online": -1,
				"distance": 1
			}
		}]);

		cursor1.toArray().then(function (results1) {
			cursor2.toArray().then(function (results2) {
				console.log("Online Users:\n", results1);
				console.log("Offline Users:\n", results2);
				if (results1 && Array.isArray(results1) && results2 && Array.isArray(results2)) {
					if (results1.length > 0 || results2.length > 0) {
						res.status(200).send({
							members: {
								online: results1,
								offline: results2
							}
						});
					} else {
						res.sendStatus(404);
					}
				} else {
					res.sendStatus(500);
				}
			});
		}).catch(function (err) {
			console.log(err);
		});
	} else {
		res.sendStatus(400);
	}
});

app.get('/member-api/find-users', function (req, res) {

	console.log('\nGET find-users API endpoint called!!!');
	console.log(req.query);

	var locationData = JSON.parse(req.query.location);
	console.log(locationData);

	var cursor = connection.db.collection('profiles').aggregate([{
		"$geoNear": {
			"near": {
				type: "Point",
				coordinates: locationData.coordinates
			},
			"spherical": true,
			"distanceField": "distance",
			"distanceMuliplier": 0.001
		}
	}, {
		"$sort": {
			"distance": 1,
			"isOnline": 1,
			"last_online": -1
		}
	}, {
		"$limit": 10000
	}], {
		"cursor": {
			"batchSize": 0
		}
	});
	cursor.toArray().then(function (results) {
		if (results && Array.isArray(results) && results.length > 0) {
			res.status(200).send(results);
		} else {
			res.sendStatus(404);
		}
	});
});

app.get('/member-api/find-users-near-me-by-distance', function (req, res) {

	console.log('\nGET find-users-near-me-by-distance API endpoint called!!!');
	if (req.query && req.query.proximity && req.query.location) {
		console.log(req.query);
		var proximity = (req.query.proximity < 500) ? req.query.proximity : 500;
		var locationData = JSON.parse(req.query.location);

		Profile.find({
			location: {
				$geoWithin: {
					$centerSphere: [locationData.coordinates, proximity / 3963.2]
				}
			}
		}).sort({
			isOnline: 1,
			last_online: -1
		}).exec(function (err, docs) {
			console.log(docs);
			if (!err) {
				res.status(200).send(docs);
			} else {
				console.log(err);
				res.sendStatus(500);
			}
		});
	} else {
		res.sendStatus(500);
	}
});

app.get('/member-api/get-thumbnail', function (req, res) {

	console.log('\nget-thumbnail API endpoint called!!!');
	console.log(req.query);
	Profile.findOne({
		_id: req.query.object_id
	}, 'thumbnail', function (err, result) {
		console.log('result:', result);
		if (result && result.thumbnail && Array.isArray(result.thumbnail) && result.thumbnail.length > 0) {
			res.json(result);
		} else if (!result.thumbnail || (result.thumbnail && Array.isArray(result.thumbnail) && result.thumbnail.length == 0)) {
			res.sendStatus(404);
			console.log(404);
		} else res.sendStatus(500);
	});
});

app.get('/member-api/get-banner', function (req, res) {

	console.log('\nget-banner API endpoint called!!!');
	console.log(req.query);
	Profile.findOne({
		_id: req.query.object_id
	}, 'banner', function (err, result) {
		console.log(result);
		if (result && result.banner && Array.isArray(result.banner) && result.banner.length > 0) {
			res.json(result);
		} else if (!result.banner || (result.banner && Array.isArray(result.banner) && result.banner.length == 0)) {
			res.sendStatus(404);
		} else res.sendStatus(500);
	});
});

app.get('/member-api/get-all-albums', function (req, res) {

	console.log('\nget-all-albums API endpoint called!!!');
	console.log(req.query);
	Album.find({
			owner_id: req.query.object_id
		}).limit(100)
		.sort({
			owner_id: 1,
			priority: 1,
			created_at: -1
		}).exec(function (err, result) {
			console.log(result);
			if (!err) {
				if (result && Array.isArray(result) && result.length > 0) {
					res.status(200).send(result);
				} else {
					res.sendStatus(404);
				}
			} else {
				res.sendStatus(500);
			}
		});
});

app.get('/member-api/get-media-from-album', function (req, res) {

	console.log('\nget-media-from-album API endpoint called!!!');
	console.log(req.query);
	Media.find({
		album_id: req.query.album_id
	}).sort({
		album_id: 1,
		posted_at: -1
	}).exec(function (err, result) {
		console.log(result);
		if (!err) {
			if (result && Array.isArray(result) && result.length > 0) {
				res.status(200).send(result);
			} else {
				res.sendStatus(404);
			}
		} else {
			res.sendStatus(500);
		}
	})
});

app.patch('/member-api/set-last-online', function (req, res) {

	console.log('\nPATCH set-last-online API endpoint called!!!');
	console.log(req.body);

	Profile.update({
			"uid": req.body.authID
		}, {
			"$set": {
				"last_online": Date.now()
			}
		}, {
			new: true
		}, function (err, doc) {
			// doc contains the modified document
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					updated_profile: doc
				});
			}
		})
		// doc contains the modified document
});

app.patch('/member-api/set-offline', function (req, res) {

	console.log('PATCH set-offline API endpoint called!!!');
	console.log(req.body);
	if (req.body && (req.body.object_id || req.body.auth_id)) {
		var objectID = req.body.object_id;
		var authID = req.body.auth_id;
		if (objectID) {
			Profile.findByIdAndUpdate(objectID, {
				"$set": {
					"isOnline": false,
					"last_online": Date.now()
				}
			}, {
				new: true
			}, function (err, doc) {
				// doc contains the modified document
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					res.status(200).json({
						updated_profile: doc
					});
				}
			})
		} else if (authID) {
			Profile.findOneAndUpdate({
				"uid": authID
			}, {
				"$set": {
					"isOnline": false,
					"last_online": Date.now()
				}
			}, {
				new: true
			}, function (err, doc) {
				// doc contains the modified document
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					res.status(200).json({
						updated_profile: doc
					});
				}
			})
		}
	} else {
		res.status(500).send("No object ID or auth ID sent to set-offline");
	}
	// doc contains the modified document
});

app.patch('/member-api/update-basic-info', function (req, res) {

	console.log('\nPATCH update-basic-info API endpoint called!!!');
	console.log(req.body);

	Profile.findByIdAndUpdate(req.body.object_id, {
		"$set": {
			"username": req.body.params.username,
			"brand": req.body.params.brand,
			"profession": req.body.params.profession,
			"DOB": req.body.params.DOB
		}
	}, {
		new: true
	}, function (err, doc) {
		// doc contains the modified document
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			res.status(200).json({
				updated_profile: doc
			});
		}
	})
});

app.patch('/member-api/update-location-info', function (req, res) {

	console.log('\nPATCH update-location-info API endpoint called!!!');
	console.log(req.body);

	var countryData = {
		name: req.body.params.country.name,
		countryCode: req.body.params.country.code
	}

	var locationData = {
		coordinates: req.body.params.coordinates,
		type: "Point"
	}

	Profile.findByIdAndUpdate(req.body.object_id, {
		"$set": {
			"city": req.body.params.city,
			"state": req.body.params.state,
			"postalcode": req.body.params.postalcode,
			"country": countryData,
			"location": locationData
		}
	}, {
		new: true
	}, function (err, doc) {
		// doc contains the modified document
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			res.status(200).json({
				updated_profile: doc
			});
		}
	})
});

app.patch('/member-api/update-personal-info', function (req, res) {

	console.log('\nPATCH update-personal-info API endpoint called!!!');
	console.log(req.body);

	if (Array.isArray(req.body.params.interests)) {
		var sliceAmount = (req.body.params.interests <= 30 ? req.body.params.interests.length : 30);
		Profile.findByIdAndUpdate(req.body.object_id, {
			"$set": {
				"biography": req.body.params.biography,
				"headline": req.body.params.headline,
				"interests": req.body.params.interests.slice(0, sliceAmount)
			}
		}, {
			new: true
		}, function (err, doc) {
			// doc contains the modified document
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					updated_profile: doc
				});
			}
		})
	} else {
		res.sendStatus(500);
	}
});


app.patch('/member-api/update-thumbnail', function (req, res) {

	console.log('\nPATCH update-thumbnail API endpoint called!!!');
	console.log(req.body);

	Profile.findByIdAndUpdate(req.body.object_id, {
			"$set": {
				"thumbnail": {
					filestack: req.body.filestack_file,
					google_storage: req.body.google_storage_file,
					updated_at: Date.now()
				}
			}
		}, {
			new: true
		}, function (err, doc) {
			// doc contains the modified document
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					updated_profile: doc
				});
			}
		})
		// doc contains the modified document
});

app.patch('/member-api/update-banner', function (req, res) {

	console.log('\nPATCH update-banner API endpoint called!!!');
	console.log(req.body);

	Profile.findByIdAndUpdate(req.body.object_id, {
			"$set": {
				"banner": {
					filestack: req.body.filestack_file,
					google_storage: req.body.google_storage_file,
					updated_at: Date.now()
				}
			}
		}, {
			new: true
		}, function (err, doc) {
			// doc contains the modified document
			if (err) {
				console.log(err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					updated_profile: doc
				});
			}
		})
		// doc contains the modified document
});



app.post('/member-api/add-thumbnail-to-album', function (req, res) {

	console.log('\nPOST add-thumbnail-to-album API endpoint called!!!');
	console.log(req.body);

	Album.find({
		owner_id: req.body.uid
	}, function (err, albums) {
		if (!err) {
			var foundAlbum = null;
			console.log(albums);
			if (Array.isArray(albums)) {
				for (var i = 0; i < albums.length; i++) {
					if (albums[i].albumType === albumTypes.thumbnail) {
						foundAlbum = albums[i];
					}
				}
			}
			if (foundAlbum) {
				var filestack = req.body.filestack_file;
				var google = req.body.google_storage_file;
				var media = new Media({
					owner_id: req.body.uid,
					album_id: foundAlbum._id,
					filestack: filestack,
					google_storage: google,
					posted_at: Date.now()
				});
				media.save(function (err) {
					if (err) {

						console.log('Unable to save media to thumbnail album :()');
						res.status(500).send({
							error: "Could not save media to thumbnail album :("
						});
						console.log(err);
					} else {
						console.log('Successfully saved media to thumbnail album! :)');
						res.status(200).send({
							message: 'Successfully added thumbnail to new album.'
						});
					}
				});
			} else {
				console.log('There is no thumbnail album. Creating one...');
				var newAlbum = new Album({
					owner_id: req.body.uid,
					name: 'Display',
					albumType: albumTypes.thumbnail,
					created_at: Date.now(),
					priority: 1
				});
				Album.create({
					owner_id: req.body.uid,
					name: 'Display',
					albumType: albumTypes.thumbnail,
					created_at: Date.now(),
					priority: 1
				}, function (err, createdAlbum) {
					if (err) {
						console.log(err);
						res.status(500).send({
							error: "Could not save thumbnail :("
						});
					} else {
						console.log('New album created!');
						var filestack = req.body.filestack_file;
						var google = req.body.google_storage_file;
						var media = new Media({
							owner_id: req.body.uid,
							album_id: createdAlbum._id,
							filestack: filestack,
							google_storage: google,
							posted_at: Date.now()
						});
						media.save(function (err) {
							console.log('Creating media...');
							if (err) {
								console.log(err);
								res.status(500).send({
									error: "Could not save thumbnail :("
								});
							} else res.status(200).send({
								message: 'Successfully added thumbnail to new album.'
							});
						});
					}
				});
			}
		} else {
			console.log(err);
			res.status(500).send({
				message: 'Error adding thumbnail to album.'
			});
		}
	});
});

app.post('/member-api/add-banner-to-album', function (req, res) {

	console.log('POST add-banner-to-album API endpoint called!!!');
	console.log(req.body);

	Album.find({
		owner_id: req.body.uid
	}, function (err, albums) {
		if (!err) {
			var foundAlbum = null;
			console.log(albums);
			if (Array.isArray(albums)) {
				for (var i = 0; i < albums.length; i++) {
					if (albums[i].albumType === albumTypes.banner) {
						foundAlbum = albums[i];
					}
				}
			}
			if (foundAlbum) {
				var filestack = req.body.filestack_file;
				var google = req.body.google_storage_file;
				var media = new Media({
					owner_id: req.body.uid,
					album_id: foundAlbum._id,
					filestack: filestack,
					google_storage: google,
					posted_at: Date.now()
				});
				media.save(function (err) {
					if (err) {

						console.log('Unable to save media to banner album :()');
						res.status(500).send({
							error: "Could not save media to banner album :("
						});
						console.log(err);
					} else {
						console.log('Successfully saved media to banner album! :)');
						res.status(200).send({
							message: 'Successfully added banner to new album.'
						});
					}
				});
			} else {
				console.log('There is no banner album. Creating one...');
				var newAlbum = new Album({
					owner_id: req.body.uid,
					name: 'Display',
					albumType: albumTypes.banner,
					created_at: Date.now(),
					priority: 1
				});
				Album.create({
					owner_id: req.body.uid,
					name: 'Display',
					albumType: albumTypes.banner,
					created_at: Date.now(),
					priority: 1
				}, function (err, createdAlbum) {
					if (err) {
						console.log(err);
						res.status(500).send({
							error: "Could not save banner :("
						});
					} else {
						console.log('New album created!');
						var filestack = req.body.filestack_file;
						var google = req.body.google_storage_file;
						var media = new Media({
							owner_id: req.body.uid,
							album_id: createdAlbum._id,
							filestack: filestack,
							google_storage: google,
							posted_at: Date.now()
						});
						media.save(function (err) {
							console.log('Creating media...');
							if (err) {
								console.log(err);
								res.status(500).send({
									error: "Could not save banner :("
								});
							} else res.status(200).send({
								message: 'Successfully added banner to new album.'
							});
						});
					}
				});
			}
		} else {
			console.log(err);
			res.status(500).send({
				message: 'Error adding banner to album.'
			});
		}
	});
});

app.post('/member-api/register-basic-profile', function (req, res) {

	console.log('POST register-basic-profile API endpoint called!!!');
	console.log(req.body);
	if (req.body) {
		var countryData = {
			name: req.body.country.name,
			countryCode: req.body.country.code
		}

		var locationData = {
			coordinates: req.body.coordinates
		}

		if (req.body.uid) {
			Profile.create({
				uid: req.body.uid,
				username: req.body.username,
				headline: req.body.headline,
				email: req.body.email,
				brand: req.body.brand,
				profession: req.body.profession,
				biography: req.body.biography,
				DOB: req.body.DOB,
				thumbnail: null,
				banner: null,
				gallery: null,
				city: req.body.city,
				state: req.body.state,
				postalcode: req.body.postalcode,
				location: locationData,
				anchorPoints: [],
				country: countryData,
				interests: req.body.interests,
				isProfileComplete: false,
				isProfileVerified: false,
				member_since: Date.now(),
				last_online: null
			}, function (err, profile) {
				if (err) {
					res.status(500).send({
						error: "Could not create profile :("
					});
					console.log(err);
					console.log("WTF Dude!!! Profile Not Created!!!-----register-basic-profile-----");
				} else {
					res.status(200).send({
						profile: profile
					});
				}
			});
		} else {
			res.status(500).send({
				error: "Must provide a uid."
			});
		}
	} else {
		res.status(500).send({
			error: "Could not create profile :("
		});
	}
});

app.post('/member-api/save-interests', function (req, res) {

	console.log('POST save-interests API endpoint called!!!');
	console.log(req.body);

	Profile.findByIdAndUpdate(req.body.object_id, {
		"$set": {
			"interests": req.body.interests
		}
	}, {
		new: true
	}, function (err, doc) {
		// doc contains the modified document
		if (err) {
			console.log(err);
			res.sendStatus(500);
		} else {
			res.status(200).json({
				updated_profile: doc
			});
		}
	})
});


app.post('/api/submit-video', function (req, res) {

	console.log('POST submit-video API endpoint called!!!');
	console.log(req.body);

	VideoSubmission.create({
		video: req.body.params.video,
		email: req.body.params.email,
		caption: req.body.params.caption,
		additionalInfo: req.body.params.additionalInfo,
		accepted: false,
		submitted_at: req.body.params.submitted_at
	}, function (err, video) {
		if (err) {
			res.statusCode = 501;
			res.send("Bad Format.");
			console.log("WTF Dude!!! Video Submission Not Created!!!-----submit-video-----");
		}
		res.status(200).send("We lit.");
	});
});

app.post('/api/submit-images', function (req, res) {

	console.log('POST submit-image API endpoint called!!!');
	console.log(req.body);

	ImageSubmission.create({
		images: req.body.params.images,
		email: req.body.params.email,
		caption: req.body.params.caption,
		additionalInfo: req.body.params.additionalInfo,
		accepted: false,
		submitted_at: req.body.params.submitted_at
	}, function (err, image) {
		if (err) {
			res.statusCode = 501;
			res.send("Bad Format.");
			console.log("WTF Dude!!! Image Submission Not Created!!!-----submit-image-----");
		} else {
			res.status(200).send("We lit.");
		}
	});
});
/*
app.get('/adminapi/getApplications', function (req, res) {



	// use mongoose to get all todos in the database
	Todo.find({}, function (err, todos) {

		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err)
			if (err) throw err;
		console.log('getApplications API endpoint called!!!');
		console.log(todos);
		res.json(todos); // return all todos in JSON format
	});
});

// create todo and send back all todos after creation
app.post('/api/createApplication', function (req, res) {

	console.log('createApplication API endpoint called!!!');
	console.log(req.body);

	// create a todo, information comes from AJAX request from Angular
	Todo.create({
		uid: req.body.params.uid,
		applicationID: req.body.params.applicationID,
		fname: req.body.params.fname,
		lname: req.body.params.lname,
		busname: req.body.params.busname,
		email: req.body.params.email,
		phone: req.body.params.phone,
		bustype: req.body.params.bustype,
		busdetail: req.body.params.busdetail,
		address: req.body.params.address,
		additionalinfo: req.body.params.additionalinfo,
		emailVerified: req.body.params.emailVerified,
		VerificationMethod: req.body.params.VerificationMethod,
		MediaDownloadUrl1: req.body.params.MediaDownloadUrl1,
		MediaDownloadUrl2: req.body.params.MediaDownloadUrl2,
		isApplicationAccepted: false,
		created_at: req.body.params.created_at,
		updated_at: ""
	}, function (err, todo) {
		if (err) {
			res.send(err);
			console.log("WTF Dude!!! Todo Not Created!!!-----CreateTodo-----");
		}
		res.json(todo);
	});
});

// delete a todo
app.delete('/adminapi/deleteApplication/:app_id', function (req, res) {
	Todo.remove({
		_id: req.params.app_id
	}, function (err, todo) {
		if (err)
			res.send(err);

		// get and return all the todos after you create another
		Todo.find(function (err, todos) {
			if (err)
				res.send(err)
			res.json(todos);
		});
	});
});*/
