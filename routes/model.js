// Fichier contenant les différents fonctions et objets utilisés pour les services Web relatif à la BDD du site

var client = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://user-lonewolf:lonelywolf@ds045604.mongolab.com:45604/lonewolf';

// Fonction permettant d'aller récupérer l'ensemble des joueurs dans la base de données
exports.getAll = function(req,res,callback){
	client.connect(url, function (err, db){
		if (err) return;
		db.collection('Players').find().toArray(function(err,docs){ 
	    	db.close();
	    	callback(docs);
		});
	});
};

// Fonction permettant d'ajouter un joueur dans la base de données du site
exports.addPlayer = function(req,res,player,callback){
	client.connect(url, function (err, db){
		if (err) return;
		db.collection('Players').insertOne(player,function(err,docInserted){ 
	    	var id = docInserted.insertedId;
	    	var joueur = docInserted.ops;
	    	db.close();
	    	callback(id,joueur);
		});
	});
};

// Fonction permettant d'aller récupérer un joueur en particulier dans la base de données
exports.getPlayer = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = req.params.idJoueur;
		var id = ObjectId(idPlayer);
	
		db.collection('Players').find({"_id": id}).toArray(function(err,doc){
			db.close();
			callback(doc);
		});
	});
};

// Fonction permettant de mettre à jour un joueur de la base de données
exports.update = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = req.params.idJoueur;
		var ID = ObjectId(idPlayer);
		var player = req.body.player;
		
		console.log("Ici ");
		console.log(player);
		
		db.collection('Players').update({"_id": ID},{$set: player,$currentDate: { "lastModified": true }},function(){
			db.close();
			callback();
		});
	});
};

// Fonction permettant de mettre à jour un joueur dans la BDD
exports.updateCorps = function(joueur,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = joueur._id;
		var ID= ObjectId(idPlayer);
		
		db.collection('Players').update({"_id": ID},{$set: {endurance : joueur.endurance, enduranceBonifiee: joueur.enduranceBonifiee}, $currentDate: { "lastModified": true }},function(){
			db.close();
			callback();
		});
	});
};

// Fonction permettant de supprimer un joueur de la base de données
exports.deletePlayer = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = req.params.idJoueur;
		var id = ObjectId(idPlayer);
		db.collection('Players').deleteOne({"_id" : id},function(){
			db.close();
			callback();
		});
	});
};

exports.deleteCePlayer = function(id,callback){
	client.connect(url,function(err,db){
		if(err) return;
		db.collection('Players').deleteOne({"_id": ObjectId(id)},function(){
			callback();
		});
	});
};

// Fonction permettant d'aller récupérer l'ensemble des avancements contenus dans la base de données
exports.getAllAvancement = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		db.collection('GameState').find().toArray(function(err,docs){
			db.close();
			callback(docs);
		});
	});
};

// Fonction permettant d'ajouter un avancement dans la base de données
exports.addGameState = function(req,res,ID,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var gameState = {page: 1, idJoueur: ID};
		db.collection('GameState').insertOne(gameState,function(err){
			db.close();
			callback();
		});
	});
};

// Fonction permettant d'aller récupérer un avancement dans la base de données
exports.getAvancement = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = req.params.idJoueur;
		var id = ObjectId(idPlayer);
		db.collection('GameState').find({idJoueur: id}).toArray(function(err,doc){
			db.close();
			callback(doc);
		});
	});
};

// Fonction permettant de mettre à jour un avancement particulier de la base de données via le changement de page
exports.updateAvancement = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var numeroPage = req.session.page;
		var id = req.session.idJoueur;
		var ID = ObjectId(id);
		db.collection('GameState').update({idJoueur: ID},{idJoueur: ID, page: numeroPage},function(){
			db.close();
			callback();
		});
	});
};

// Fonction permettant de mettre à jour un avancement directement via le service web
exports.updateAvancementService = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idJ = req.params.idJoueur;
		var changement = req.body.changement;
		console.log(changement);
		console.log(idJ);
		db.collection('GameState').update({"idJoueur": ObjectId(idJ)},{$set: changement,$currentDate: { "lastModified": true }}, function(){
			db.close();
			callback();
		});
	});
};

// Fonction permettant de supprimer un avancement dans la base de données
exports.deleteAvancement = function(req,res,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var idPlayer = req.params.idJoueur;
		var ID = ObjectId(idPlayer);
		db.collection('GameState').deleteOne({idJoueur: ID},function(){
			db.close();
			callback();
		});
	});
};

exports.deleteCetAvancement = function(id,callback){
	client.connect(url,function(err,db){
		if(err) return;
		db.collection('GameState').deleteOne({idJoueur: ObjectId(id)},function(){
			callback();
		});
	});
};

// Fonction ajoutant un combat dans la base de données
exports.addCombat = function(id,callback){
	client.connect(url,function(err,db){
		if(err) return;
		var combat = {idJoueur: id, historique: [], infosCombat: {}, rounds: []};
		db.collection('Combats').insertOne(combat,function(err){
			db.close();
			callback();
		});
	});
};

// Fonction renvoyant un combat de la base de donnée 
exports.getCombat = function(id,callback){
	client.connect(url, function(err,db){
		if(err) return;
		db.collection('Combats').find({idJoueur: ObjectId(id)}).toArray(function(err,doc){
			db.close();
			callback(doc);
		})
	});
};

// Fonction mettant à jour le combat dans la base de donnée
exports.updateCombat = function(id,combat,callback){
	client.connect(url,function(err,db){
		if(err) return;
		db.collection('Combats').update({"idJoueur": ObjectId(id)},{$set: combat, $currentDate: {"lastModified": true}}, function(){
			db.close();
			callback();
		});
	});
};

// Fonction permettant de supprimer un combat de la base de donnée
exports.deleteCombat = function(id,callback){
	client.connect(url,function(err,db){
		if(err) return;
		db.collection('Combats').deleteOne({idJoueur: ObjectId(id)},function(){
			callback();
		});
	});
};