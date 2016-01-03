var express = require('express');
var model = require('./model.js');
var router = express.Router();

var pageRepas = [12,155]; // Tableau contenant le numéro des pages où se le joueur doit faire une décision

var pageDecision = [];

var pageCombat = [{page:78,ennemy:{name:"Bakanal", habilite : 19, endurance : 30},suite:245}, {page: 180, ennemy: {name:"Languabarbe", habilite: 11, endurance: 1}, suite: 70}]; // Tableau contenant l'ensemble des pages où un combat peut avoir lieu

var pagePerte = [{page:331, perte:4, fonction: function(personnage) {return !personnage["listeDisciplines"].contains("Guérison")} },
				{page:209, perte:2, fonction: function(personnage) {return true} },
				{page:339, perte:900, fonction: function(personnage) {return true} },
				{page:129, perte:3, fonction: function(personnage) {return !personnage["listeSpeciale"].contains("Huile de Bakanal")} }];

// Tableau contenant le numéro des pages où il y a un choix aleatoire sur la decision du joueur
var choixAleatoire = [{id: 167, fonction : function(){var nombreAleatoire = Math.floor(10*Math.random()); 
if(nombreAleatoire <= 6){return 85;} else {return 300;}}},{id: 331, fonction : function(){var nombreAleatoire = Math.floor(10*Math.random()); 
if(nombreAleatoire <= 4){return 62;} else {return 288;}}},{id: 155, fonction : function(){var nombreAleatoire = Math.floor(10*Math.random()); 
if(nombreAleatoire <= 2){return 148;} else {return 191;}}},{id: 134, fonction : function(){var nombreAleatoire = Math.floor(10*Math.random()); 
if(nombreAleatoire <= 3){return 57;} else if(nombreAleatoire <= 6 && nombreAleatoire >= 4){return 188;} else {return 331;}}}];

// Tableau contenant toutes les disciplines 
var disciplines = {CAMOUFLAGE: "Camouflage", CHASSE: "Chasse", SIXIEME: "Sixième sens", ORIENTATION: "Orientation", GUERISON: "Guérison", 
MAITRISE_ARME: "Maîtrise des armes", BOUCLIER_PSY: "Bouclier Psychique", PUISSANCE_PSY: "Puissance Psychique", COMM_ANIMAL: "Communication animale",
MAITRISE_PSY: "Maîtrise psychique"};

// Tableau contenant toutes les armes
var armes = {EPEE: "Epée", SABRE: "Sabre", LANCE: "Lance", MASSE_ARMES: "Masse d'armes", MARTEAU: "Marteau de guerre", HACHE:"Hâche", 
BATON:"Baton", GLAIVE:"Glaive", POIGNARD : "Poignard"};

// Tableau contenant tous les items
var items = {RATION:"Ration", RATION_SPE: "Ration spéciale",POTION:"Potion de Lampur",COUVERTURE_FOURRURE: "Couverture en fourrure",
    CORDE: "Corde"};
var spe = {MATELASSEE: "Veste matelassée",
    HUILE_DE_BAKANAL: "Huile de Bakanal",
    EPEE_OS: "Épée Os",
    DISQUE_PIERRE_BLEUE: "Disque Pierre Bleue"};

// Tableau choix de page
var choixPage = [{page:1,choix:[160,273]},{page:12,choix:[180,259]},{page:57,choix:[331]},{page:62,choix:[167]},{page:70,choix:[339]},
{page:78,choix:[]},{page: 85, choix: [49,212]},{page:91,choix:[134]},{page:129,choix:[155]},{page:134,choix:[]},{page:155,choix:[]},
{page:160,choix:[78]},{page:167,choix:[]},{page: 172, choix: [134]},{page: 180, choix: []},{page:188, choix:[232,346]},
{page: 204, choix: [134]}, {page: 209, choix:[155]},{page: 245, choix: [91,172]},{page:248,choix:[]},{page: 288, choix:[167]},{page:300, choix:[238]},
{page: 318, choix:[134]},{page: 331, choix: []},{page:339, choix:[134]}];

// Tableau des choix soumis à condition sur une discipline
var choixSousCondition = [{page:160, choix: [{page:204, competences:disciplines.CHASSE, value:true},{page:318,competences:disciplines.COMM_ANIMAL, value:true}]},
						  {page:70, choix: [{page:209, competences:spe.HUILE_DE_BAKANAL, value:true},{page:339,competences:spe.HUILE_DE_BAKANAL, value:false}]},
						  {page: 85, choix: [{page: 98, competences: disciplines.SIXIEME}]}];

// Tableau de pages avec ajout d'item
var pageItems = [{page:12, items: [{item: items.RATION, type:"sac"},{item: items.COUVERTURE_FOURRURE, type:"sac"},{item: items.CORDE, type: "sac"}]},{page: 57, items: [{item: spe.EPEE_OS, type:"special"},{item: spe.DISQUE_PIERRE_BLEUE, type:"special"}]},
{page: 91, items: [{item: spe.HUILE_DE_BAKANAL, type: "special"}]}];
/* Fonctions supplémentaires */

// Fonction qui verifie si un chexbox est bien défini
function isCheckboxDefined(checkbox){
	return !(typeof(checkbox) == "undefined");
}

// Fonction qui verifie si une page a des choix aléatoire ou pas
function isRandomPage(numeroPage) {
	var i = 0;
	for(i=0; i < choixAleatoire.length ; i++){
		if(choixAleatoire[i].id == numeroPage){
			return true;
		}
	}
	return false;
}

// Fonction qui verifie si une page a des pertes
function isPertePage(numeroPage) {
	var i = 0;
	for(i=0; i < pagePerte.length ; i++){
		if(pagePerte[i].page == numeroPage){
			return i;
		}
	}
	return -1;
}

// Fonction qui cherche le choix lié à une page
function getChoix(numeroPage) {
	var i = 0;
	var choix = {};
	for(i=0;i<choixPage.length;i++){
		if(choixPage[i].page == numeroPage){
			console.log(choixPage[i]);
			choix = choixPage[i].choix;
			break;
		}
	}
	
	return choix;
}

// Fonction permettant de rendre l'ensemble des choix, déterminé en fonction des disciplines du joueur
function getConditions(req){
	var i = 0;
	var numeroPage = req.params.pagenum;
	var choix = {};
	var choixOk= [];
	var choixNotOk = [];
	var resultat = {};
	var personnage = req.session.personnage;
	for(i=0;i<choixSousCondition.length;i++){
		if(choixSousCondition[i].page == numeroPage){
			choix = choixSousCondition[i].choix;
			break;
		}
	}
	
	if(choix == {}){
		return {};
	}
	
	for(i=0; i<choix.length;i++){
		if((personnage.listeSpeciale.contains(choix[i].competences)==choix[i].value)|| personnage.listeDisciplines.contains(choix[i].competences) ){
			choixOk.push(choix[i].page);
		} else  {
			choixNotOk.push(choix[i].page);
		}
	}
	
	resultat.choixOk = choixOk;
	resultat.choixNotOk = choixNotOk;
	return resultat;
}



//Fonction informant si une page est une page de combat potentiel ou non
function estCombat(numeroPage){
	var i =0;
	for(i=0;i<pageCombat.length;i++){
		if(pageCombat[i].page == numeroPage){
			return pageCombat[i];
		}
	}
	
	return {};
}

// Fonction récupérant si il y a des items à ajouter ou non dans la page
function getItemPage(numeroPage){
	var i =0;
	var listeItems = null; 
	for(i=0;i<pageItems.length;i++){
		if(pageItems[i].page == numeroPage){
			listeItems = pageItems[i].items;
			break;
		}
	}
	
	if(listeItems == null){
		listeItems = [];
	}
	
	return listeItems;
}

// Fonction mettant un joueur à jour grâce à un JSON
function majJoueur(joueur,json){
	joueur.listeItems = json.listeItems;
	joueur.listeSpeciale = json.listeSpeciale;
	joueur.listeArmes = json.listeArmes;
}

// Implémentation de la méthode contains pour la classe Array
Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}

 // Fonction qui calcule le nombre d'endurance perdue par le joueur et l'ennemi grace au tableau Combat Ratio et du calcul du quotient d'attaque
function getEndurancePerdue(habiliteJoueur,habiliteEnnemy){
	
	var ratio = habiliteJoueur - habiliteEnnemy;  // Quotient d'attaque
	var nbAleatoire = Math.floor(10*Math.random()); // Generation du nombre aléatoire
	// Tableau du Combat Ratio  - Il s'agit d'un objet où la clé représente le nombre aléatoire choisi et la valeur constitue un tableau de tableau où
	// chaque élément du tableau correspond à :
	// [ IntervalleGauche,IntervalleDroit , Degat Ennemi , Degat Joueur ]  - L : Less , G : Greater , K: Instant Kill
	var CombatRatio = { 
	1 : [["L","-11",0,"K"],[-10,-9,0,"K"],[-8,-7,0,8],[-6,-5,0,6],[-4,-3,1,6],[-2,-1,2,5],[0,0,3,5],
							  [1,2,4,5],[3,4,5,4],[5,6,6,4],[7,8,7,4],[9,10,8,3],[11,"G",9,3]],
							  
	2 : [["L",-11,0,"K"],[-10,-9,0,8],[-8,-7,0,7],[-6,-5,1,6],[-4,-3,2,5],[-2,-1,3,5],[0,0,4,4],
								  [1,2,5,4],[3,4,6,3],[5,6,7,3],[7,8,8,3],[9,10,9,3],[11,"G",10,2]],
	
	3 : [["L",-11,0,8],[-10,-9,0,7],[-8,-7,1,6],[-6,-5,2,5],[-4,-3,3,5],[-2,-1,4,4],[0,0,5,4],
								  [1,2,6,3],[3,4,7,3],[5,6,8,3],[7,8,9,2],[9,10,10,2],[11,"G",11,2]],

	4 : [["L",-11,0,8],[-10,-9,1,7],[-8,-7,2,6],[-6,-5,3,5],[-4,-3,4,4],[-2,-1,5,4],[0,0,6,3],
								  [1,2,7,3],[3,4,8,3],[5,6,9,2],[7,8,10,2],[9,10,11,2],[11,"G",12,2]],

	5 : [["L",-11,1,7],[-10,-9,2,6],[-8,-7,3,4],[-6,-5,4,4],[-4,-3,5,4],[-2,-1,6,3],[0,0,7,2],
								  [1,2,8,2],[3,4,9,2],[5,6,10,2],[7,8,11,2],[9,10,12,2],[11,"G",14,1]],
								  
	6 : [["L",-11,2,6],[-10,-9,3,6],[-8,-7,4,5],[-6,-5,5,4],[-4,-3,6,3],[-2,-1,7,2],[0,0,8,2],
								  [1,2,9,2],[3,4,10,2],[5,6,11,1],[7,8,12,1],[9,10,14,1],[11,"G",16,1]],
								  
	7 : [["L",-11,3,5],[-10,-9,4,5],[-8,-7,5,4],[-6,-5,6,3],[-4,-3,7,2],[-2,-1,8,2],[0,0,9,1],
								  [1,2,10,1],[3,4,11,1],[5,6,12,0],[7,8,14,0],[9,10,16,0],[11,"G",18,0]],

	8 : [["L",-11,4,4],[-10,-9,5,4],[-8,-7,6,3],[-6,-5,7,2],[-4,-3,8,1],[-2,-1,9,1],[0,0,10,0],
								  [1,2,11,0],[3,4,12,0],[5,6,14,0],[7,8,16,0],[9,10,18,0],[11,"G","K",0]],
								  
	9 : [["L",-11,5,3],[-10,-9,6,3],[-8,-7,7,2],[-6,-5,8,0],[-4,-3,9,0],[-2,-1,10,0],[0,0,11,0],
								  [1,2,12,0],[3,4,14,0],[5,6,16,0],[7,8,18,0],[9,10,"K",0],[11,"G","K",0]],
								  
	0 : [["L",-11,6,0],[-10,-9,7,0],[-8,-7,8,0],[-6,-5,9,0],[-4,-3,10,0],[-2,-1,11,0],[0,0,12,0],
								  [1,2,14,0],[3,4,16,0],[5,6,18,0],[7,8,"K",0],[9,10,"K",0],[11,"G","K",0]]};
								  
	// Recuperation du tableau correspondant au nombre aléatoire obtenu
	var endurancePerdueJ = CombatRatio[nbAleatoire];
	// Parcours des élements du tableau en fonction du quoitient d'attaque obtenu
	for(s in endurancePerdueJ){
		var c=endurancePerdueJ[s];
		if((c[0] == "L" && ratio < -11) || (c[0] <= ratio && ratio <= c[1]) || (c[1] == "G" && ratio > 11)){
			return {endurancePerdueEnnemy: c[2], endurancePerdueJoueur: c[3], chiffreAleatoire: nbAleatoire, quotientAttaque: ratio};
		}
	}
}

// Fonction de validation du formulaire de création du joueur
var formValidation = function(req){
	var name = req.body.name; // Recuperation du nom du joueur
	var checkbox1 = req.body.checkbox1; //Recuperation des valeurs checkbox Discipline
	var checkbox2 = req.body.checkbox2; //Recuperation des valeurs checkbox Item
	var validation = true;
	var error = [];
	if(!name){ // S'il n'y a pas de nom alors on affiche une erreur
		error.push("Nom du joueur vide \n");
		validation =false;
	}
	if(isCheckboxDefined(checkbox1)){ // S'il n'y a pas exactement 5 disciplines alors on affiche une erreur
		if(checkbox1.length != 5){
			error.push("Le nombre de compétences choisi doit être égal à 5");
			validation =false;
		}
	}
	else{
		error.push("Le nombre de compétences choisi doit être égal à 5");
		validation =false;
	}
	if(isCheckboxDefined(checkbox2)){ // S'il n'y a pas exactement 2 item alors on affiche une erreur
		if(checkbox2.length != 2){
			error.push("Le nombre d'item de depart choisi doit être égal à 2");
			validation =false;
		}
	}
	else{
		error.push("Le nombre d'item de depart choisi doit être égal à 2");
		validation =false;
	}
	req.session.error = error;
	return validation;
	
}

// Fonction qui va crée l'objet Joueur (après validation)
var CreationJoueur = function(req){

	// Creation de l'objet joueur
	var joueur = {name : ""  ,listeArmes : [] , listeItems : [] , listeDisciplines : [] , listeSpeciale : [] , habiliteBonifiee : 0 , enduranceBonifiee : 0  };
	// Recuperation du nom du joueur
	joueur.name = req.body.name;
	// Recuperation des disciplines du joueur
	for( i in req.body.checkbox1){
		disciplineChoisie = req.body.checkbox1[i];
		if(disciplineChoisie != null){
			joueur.listeDisciplines.push(disciplines[disciplineChoisie]);
		}
		if(disciplineChoisie == "MAITRISE_ARME"){
			joueur.specialiteArme = Math.floor(10*Math.random());
		}
	}
	
	// Recuperation des items du joueur
	for( i in req.body.checkbox2){
		itemChoisie = req.body.checkbox2[i];
		if(itemChoisie in armes){
			joueur.listeArmes.push(armes[itemChoisie]);
			// Ajout de point habilite Bonifiee pour certains cas speciaux
			if((joueur.specialiteArme == 5 && itemChoisie == "EPEE") || (joueur.specialiteArme == 7 && itemChoisie == "EPEE") 
				|| (joueur.specialiteArme == 3 && itemChoisie == "SABRE") || (joueur.specialiteArme == 1 && itemChoisie == "LANCE")
				|| (joueur.specialiteArme == 2 && itemChoisie == "MASSE_ARME") || (joueur.specialiteArme == 6 && itemChoisie == "HACHE")
				|| (joueur.specialiteArme == 8 && itemChoisie == "BATON") || (joueur.specialiteArme == 9 && itemChoisie == "GLAIVE")
				|| (joueur.specialiteArme == 4 && itemChoisie == "MARTEAU") ){
							joueur.habiliteBonifiee = 2;
			}
		}
		else if(itemChoisie in spe){
			joueur.listeSpeciale.push(spe[itemChoisie]);
			joueur.enduranceBonifiee = 2;
		}
		else if(itemChoisie in items){
			joueur.listeItems.push(items[itemChoisie]);
		}
	
	}
	
	joueur.habilite = 10 + Math.floor(10*Math.random());
	joueur.endurance = 20 + Math.floor(10*Math.random());
	joueur.pieceOr = 10 + Math.floor(10*Math.random());
	
	joueur.habiliteBonifiee += joueur.habilite;
	joueur.enduranceBonifiee += joueur.endurance;
	
	return joueur;
}

// Fonction servant à vider la session
var cleanSession = function(req){
	req.session.personnage = null;
	req.session.idJoueur = null;
	req.session.page = null;
	req.session.historique = null;
	req.session.infosCombat = null;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title:'Page d\'accueil', menu: 1});
});

router.get('/homepage',function(req,res,next) {
	res.render('homepage',{title:'Bienvenue', menu: 2});
});

router.get('/pagehistoire',function(req,res,next) {
	res.render('pagehistoire',{title:'Volonar Le Traître'});
});

router.get('/pagecreation',function(req,res,next) {
	model.getAll(req,res,function(docs){
		res.render('pagecreation',{title:'Creation du personnage', personnages: docs});
	});
});

// Route pour le service Web Creation stockant le JSON du joueur dans la session
router.post('/pagecreation',function(req,res,next) {
	
	var isFormValid = formValidation(req); // Verification du formulaire
    if(!isFormValid){ // Si le formulaire est invalide alors reaffiche le formulaire avec les erreurs
		res.render('pagecreation',{
			error: req.session.error
		});	
	}
	else{
		var player = CreationJoueur(req);
		model.addPlayer(req,res,player,function(ID,Joueur){
			req.session.idJoueur = ID;
			req.session.personnage = Joueur[0];
			req.session.page = 1;
			req.session.historique = [];
			req.session.infosCombat = {};
			
			model.addGameState(req,res,ID,function(){
				model.addCombat(ID,function(){
					res.redirect('/page');
				});
			});
		});
	}
});

// Route servant à charger un joueur déjà créé à partir de la base de données
router.get('/load/:idJoueur',function(req,res){
	var joueur = null;
	var page = null;
	var historique = null;
	var rounds = null;
	var infosCombat = null;
	
	model.getPlayer(req,res,function(doc){
		joueur = doc[0];
		model.getAvancement(req,res,function(doc){
			page = doc[0];
			model.getCombat(joueur._id,function(doc){
				historique = doc[0].historique;
				rounds = doc[0].rounds;
				infosCombat = doc[0].infosCombat;
				
				req.session.personnage = joueur;
				req.session.idJoueur = joueur._id;
				req.session.page = page.page;
				req.session.historique = historique;
				
				if(rounds.length == 0){
					req.session.infosCombat = {};
					res.redirect('/page');
				} else {
					req.session.infosCombat = infosCombat;
					res.redirect('/combat');
				}
			});
		});
	});
});

// Route servant à obtenir l'unique page qui va servir à charger toutes les autres via AJAX
router.get('/page',function(req,res){
	res.render('page',{});
});

// Route servant à rediriger le joueur vers la bonne page après son choix d'item.
router.post('/jeu/:numpage',function(req,res,next) {
	var numeroPage = parseInt(req.params.numpage);
	switch(numeroPage){
		case 57:
		res.redirect('/jeu/331');
		break;
		
		default:
		res.redirect('/jeu/331');
		break;
	}
	
});

// Route verifiant si la page demandé est une page evenement alors on le redirige directement dans la section 1
router.get('/jeu/:pagenum',function(req,res) {
	req.session.page = req.params.pagenum;
	model.updateAvancement(req,res,function(){
		if(!pageDecision.contains(req.params.pagenum)){
			res.render('page'+req.params.pagenum,{title:req.params.pagenum,numeroPage: req.params.pagenum});
		} else {
			res.redirect('/jeu/'+req.params.pagenum+'/1');
		}
	});
});

// Route verifiant si la page demandé est une page muni de la section contient bien un evenement (ou une section) sinon on le redirige dans la page globale
router.get('/jeu/:pagenum/:sectionNum',function(req,res) {
	if(!pageDecision.contains(req.params.pagenum)){ // Redirection dans la page globale (sans section)
		res.redirect('/jeu/'+req.params.pagenum);
	} else { 
		res.render('page'+req.params.pagenum,{title:req.params.pagenum,numeroPage: req.params.pagenum,section:req.params.sectionNum});
	}
});

// Route verifiant si la page demandé est une page evenement alors on le redirige directement dans la section 1
router.get('/page/:pagenum',function(req,res,next){
	req.session.page = req.params.pagenum;
	model.updateAvancement(req,res,function(){
		if(!pageDecision.contains(req.params.pagenum)){
			next();
		} else { // Redirection dans la section 1 directement.
			res.redirect('/page/'+req.params.pagenum+'/1');
		}
	});
});

// Route pour le service Web renvoyant le JSON de la page complet (où il y a un évenement/combat ) 
router.get('/page/:pagenum',function(req,res){
	var pageJeu = "page" + req.params.pagenum;
	var combat = estCombat(req.params.pagenum);
	var choixPageCondition = getConditions(req);
	var choixPageLocal = getChoix(req.params.pagenum);
	var choixPageFinal = [];
	var isRandomChoicePage = isRandomPage(req.params.pagenum);
	var isPerteChoicePage = isPertePage(req.params.pagenum);
	var isItemPage = getItemPage(req.params.pagenum);
	var repas = pageRepas.contains(req.params.pagenum);
	var hasEndurancePerdue = (req.session.personnage.enduranceBonifiee < req.session.personnage.endurance) && (req.session.personnage.listeDisciplines.contains("Guérison")) ;
	
	if(repas){
		if(!req.session.personnage.listeItems.contains(items.RATION)){	
			repas = false;
			req.session.personnage.enduranceBonifiee = req.session.personnage.enduranceBonifiee - 3;
		} else {
			repas = true;
			var i = 0;
			var tmp= [];
			for(i=0;i<req.session.personnage.listeItems.length;i++){
				if(req.session.personnage.listeItems[i] != items.RATION){
					tmp.push(req.session.personnage.listeItems[i]);
				}
			}
			
			req.session.personnage.listeItems = tmp;
		}
	}
	
	var i = 0;
	
	for(i=0; i<choixPageCondition.choixOk.length;i++){
		if(!choixPageFinal.contains(choixPageCondition.choixOk[i])){
			choixPageFinal.push(choixPageCondition.choixOk[i]);
		}
	}
		
	for(i=0; i<choixPageLocal.length;i++){
		if(!choixPageFinal.contains(choixPageLocal[i])){
			choixPageFinal.push(choixPageLocal[i]);
		}
	}

	choixPageFinal.sort(function(a, b){return a-b});
	console.log(choixPageFinal);
		
	
	
	req.session.infosCombat = combat;
	
	if(isPerteChoicePage>=0){
		if(pagePerte[isPerteChoicePage].fonction(req.session.personnage)){
			req.session.personnage["enduranceBonifiee"] -= pagePerte[isPerteChoicePage].perte;
			isPerteChoicePage = true;
		}
		else{
			isPerteChoicePage = false;
		}
	}
	else{
			isPerteChoicePage = false;
		}
	
	var id = req.session.personnage._id;
	if(req.session.personnage.enduranceBonifiee <= 0){
		model.deleteCePlayer(id,function(){
			model.deleteCetAvancement(id,function(){
				model.deleteCombat(id,function(){
					cleanSession(req);
					res.json({"Suppression": "1"});
				});
			});
		});	
	}
	else{
		model.updateCorps(req.session.personnage,function(){
			res.render(pageJeu, function(err, html) {
				res.json({
					id: req.params.pagenum,
					choix: choixPageFinal,
					infosCombat: combat,
					htmlPage: html,
					isRandomChoicePage: isRandomChoicePage,
					isPerteChoicePage : isPerteChoicePage,
					isItemPage: isItemPage,
					repas:repas,
					hasEndurancePerdue : hasEndurancePerdue,
					personnage : req.session.personnage,
					section: ['page/'+req.params.pagenum+'/1','page/'+req.params.pagenum+'/2']
				});
			});	
		});
		
	}
});

// Route pour le service Web renvoyant le JSON de la page (où il y a un évenement/combat ) selon la section voulue
router.get('/page/:pagenum/:sectionnum',function(req,res){
	var pageJeu = "page" + req.params.pagenum;
	var combat = estCombat(req.params.pagenum);
	var isRandomChoicePage = isRandomPage(req.params.pagenum);
	var isPerteChoicePage = isPertePage(req.params.pagenum);
	
	req.session.infosCombat = combat;
	res.render(pageJeu, function(err, html) {
        // JSON pour la page / section 1
		if(req.params.sectionnum == 1){
        	res.json({
            	id: req.params.pagenum,
            	htmlPage: html,
            	personnage : req.session.personnage,
            	infosCombat: combat,
            	isRandomChoicePage: isRandomChoicePage,
				isPerteChoicePage: isPerteChoicePage,
            	choix: getChoix(req.params.pagenum),
            	ennemy: {name: "Bakanal", endurance: 30, habilite: 19},
            	items : []
        	});
        } 
		// JSON pour la page / section 2
		else if(req.params.sectionnum == 2){
			res.json({
           		id: req.params.pagenum,
            	htmlPage: html,
            	infosCombat: combat,
            	isRandomChoicePage: isRandomChoicePage,
				isPerteChoicePage:isPerteChoicePage,
            	choix: getChoix(req.params.pagenum)
        	});
		}
    });
});

// Route pour l'affichage de la page de combat
router.get('/combat',function(req,res,next) {
	
	var infosCombat = req.session.infosCombat;
	var combat = {rounds: [], ennemy: infosCombat.ennemy, success: false};
	var personnage = req.session.personnage;
	var ennemy = null;
	
	personnage.weak = false;
	req.session.personnage = personnage;
	req.session.PuissancePsy = personnage.listeDisciplines.contains("Puissance Psychique");
	model.getCombat(personnage._id,function(doc){
		var oldCombat = doc[0];
		var newCombat = {};
		
		newCombat.idJoueur = oldCombat.idJoueur;
		newCombat.historique = oldCombat.historique;
		newCombat.infosCombat = infosCombat;
		ennemy = infosCombat.ennemy;
		
		if(oldCombat.rounds.length == 0){
			req.session.combat = combat;
		} else {
			newCombat.rounds = oldCombat.rounds;
			ennemy.endurance = newCombat.rounds[newCombat.rounds.length-1].adegat;
			req.session.combat = {rounds: newCombat.rounds, ennemy: ennemy, success: false};
		}
		
		model.updateCombat(personnage._id,newCombat,function(){
			res.render('combat',{title: 'Combat contre Bakanal !',numeroPage: -1});
		});
	});
});

// Route pour le service Web Combat utilisant la fonction getEndurancePerdue
router.get('/combat/:habiliteWolf/:habiliteEnnemy',function(req,res){
	var resultat = getEndurancePerdue(req.params.habiliteWolf,req.params.habiliteEnnemy);
	if(typeof(req.session.combatRound) == "undefined"){
		req.session.combatRound = 1;
	} else {
		req.session.combatRound = req.session.combatRound + 1;
	}
	resultat.combatRound = req.session.combatRound;
	resultat.habiliteJoueurAvant = req.session.personnage.habilite;
	resultat.habiliteEnnemyAvant = req.session.combat.ennemy.habilite;
	resultat.enduranceJoueurAvant = req.session.personnage.enduranceBonifiee;
	resultat.enduranceEnnemyAvant = req.session.combat.ennemy.endurance;
	req.session.personnage.enduranceBonifiee = resultat.enduranceJoueurAvant - resultat.endurancePerdueJoueur;
	req.session.combat.ennemy.endurance = resultat.enduranceEnnemyAvant - resultat.endurancePerdueEnnemy;
	
	if(resultat.endurancePerdueEnnemy == "K"){
		resultat.enduranceEnnemyApres = 0;
	} else {
		resultat.enduranceEnnemyApres = req.session.combat.ennemy.endurance;
	}
	
	if(resultat.endurancePerdueJoueur == "K"){
		resultat.enduranceJoueurApres = 0;
	} else {
		resultat.enduranceJoueurApres = req.session.personnage.enduranceBonifiee;
	}
	if(resultat.enduranceEnnemyApres <= 0){
		console.log("Tu l'as fumé !");
	}
	
	if(resultat.enduranceJoueurApres <= 0){
		console.log("Dead ! RIP");
	}
	
	res.json(resultat);
});

//Route de gestion de combats
router.get('/attaque',function(req,res){
	var personnage = req.session.personnage;
	var page = req.session.page;
	var combat = req.session.combat;
	var ennemy = combat.ennemy;
	var tour = combat.rounds.length + 1;
	var round= {};
	
	var resultat = getEndurancePerdue(personnage.habiliteBonifiee,ennemy.habilite);
	round.tour = tour;
	round.mhabilite = personnage.habiliteBonifiee;
	round.mendurance = personnage.enduranceBonifiee;
	round.ahabilite = ennemy.habilite;
	round.aendurance = ennemy.endurance;
	round.ratio = resultat.quotientAttaque;
	round.random = resultat.chiffreAleatoire;
	round.endPerdueJoueur = resultat.endurancePerdueJoueur;
	round.endPerdueEnnemy = resultat.endurancePerdueEnnemy;
	
	if(page == 180){
		if(resultat.endurancePerdueEnnemy != "K"){
			round.endPerdueEnnemy = round.endPerdueEnnemy + 3;
			resultat.endurancePerdueEnnemy = resultat.endurancePerdueEnnemy + 3;
		}
	}
	
	if(resultat.endurancePerdueJoueur == "K"){
		personnage.enduranceBonifiee = 0;
	} else {
		personnage.enduranceBonifiee = personnage.enduranceBonifiee - resultat.endurancePerdueJoueur;
	}
	req.session.personnage = personnage;
	resultat.personnage = personnage;
	
	if(resultat.endurancePerdueEnnemy == "K"){
		ennemy.endurance = 0;
	} else {
		ennemy.endurance = ennemy.endurance - resultat.endurancePerdueEnnemy;
	}
	
	if(ennemy.endurance <= 0){
		combat.success = true;
	}
	
	var id = personnage._id;
	console.log(id);
	if(personnage.enduranceBonifiee <= 0){
		model.deleteCePlayer(id,function(){
			model.deleteCetAvancement(id,function(){
				model.deleteCombat(id,function(){
					cleanSession(req);
					res.json({"Suppression": "1"});
				});
			});
		});
	} else {
		round.mdegat = personnage.enduranceBonifiee;
		round.adegat = ennemy.endurance;
	
		combat.ennemy = ennemy;
		combat.rounds.push(round);
		resultat.combat = combat;
		req.session.combat = combat;
	
		model.getCombat(personnage._id,function(doc){
			var oldCombat = doc[0];
			var newCombat = {};
			newCombat.idJoueur = oldCombat.idJoueur;
			newCombat.historique = oldCombat.historique;
			if(combat.success){
				var ennemyInitial = ennemy;
				ennemyInitial.endurance = combat.rounds[0].aendurance;
				newCombat.historique.push({ennemy: ennemy, enduranceAvant: combat.rounds[0].mendurance, enduranceApres: personnage.enduranceBonifiee});
				newCombat.ennemy = {};
				newCombat.rounds= [];
				newCombat.infosCombat = {};
			
				req.session.historique.push({ennemy: ennemy, enduranceAvant: combat.rounds[0].mendurance, enduranceApres: personnage.enduranceBonifiee});
				
				if(page == 180) {
					if(combat.rounds == []){
						if(resultat.endurancePerdueJoueur == 0){
							req.session.page = 70;
						} else {
							req.session.page = 129;
						}
					} else if(personnage.enduranceBonifiee == combat.rounds[0].mendurance){
						req.session.page = 70;
					} else {
						req.session.page = 129;
					}	
				} else {
					req.session.page = req.session.infosCombat.suite;
				}
				
				req.session.infosCombat = {};
			} else {
				newCombat.ennemy = ennemy;
				newCombat.rounds = combat.rounds;
			}
		
			model.updateCombat(personnage._id,newCombat,function(){
				model.updateCorps(personnage,function(){
					res.json(resultat);			
				});
			});
		});
	}
});

router.get('/fuite',function(req,res){
	
	var personnage = req.session.personnage;
	var infosCombat = req.session.infosCombat;
	console.log(infosCombat);
	var ennemy = infosCombat.ennemy;
	var resultat = getEndurancePerdue(personnage.habiliteBonifiee,ennemy.habilite);
	
	if(resultat.endurancePerdueJoueur == "K"){
		personnage.enduranceBonifiee = 0;
	} else {
		personnage.enduranceBonifiee = personnage.enduranceBonifiee - resultat.endurancePerdueJoueur;
	}
	
	req.session.personnage = personnage;
	resultat.personnage = personnage;
	
	var id = personnage._id;
	console.log(id);
	if(personnage.enduranceBonifiee <= 0){
		model.deleteCePlayer(id,function(){
			model.deleteCetAvancement(id,function(){
				model.deleteCombat(id,function(){
					cleanSession(req);
					res.redirect('/page');
				});
			});
		});	
	} else {
		req.session.page = req.session.infosCombat.suite;
		req.session.infosCombat = {};
		resultat.personnage.weak = true;
		res.redirect('/page');
	}
});

router.get('/pageaide',function(req,res,next) {
	res.render('helppage',{title:'Page d\'aide',menu:3});
});

// Route pour les services Web renvoyant le JSON du joueur ou l'ensemble des joueurs
router.get('/joueur',function(req,res){
	model.getAll(req,res,function(docs){
		res.json(docs);
	});
});

// Route affichant un joueur particulier
router.get('/joueur/:idJoueur',function(req,res){
	model.getPlayer(req,res,function(doc){
		res.json(doc);
	});
});

// Puissance Psy
router.get('/PuissancePsy',function(req,res){
	req.session.personnage.habiliteBonifiee += 2;
	model.update(req,res,function(){
		res.json({"Update ": "1"});
	});
});

// Utilisation Guerison
router.get('/utiliserGuerison',function(req,res){
	if(req.session.personnage.listeDisciplines.contains("Guérison")){
		console.log("ok");
		var index  = req.session.personnage.listeDisciplines.indexOf("Guérison");		
		console.log(index);
		req.session.personnage.enduranceBonifiee += 1;
		req.session.personnage.listeDisciplines.splice(index,1);
		model.update(req,res,function(){
			res.json({"Update ": "1"});
		});
	}
	else{
		res.json({"Update ": "1"});
	}
});


// Route mettant à jour un joueur 
router.put('/joueur/:idJoueur',function(req,res){
	var personnage = req.session.personnage;
	var changement = req.body.player;
	
	personnage.listeItems = changement.listeItems;
	personnage.listeArmes = changement.listeArmes;
	personnage.listeSpeciale = changement.listeSpeciale;
	
	req.session.personnage = personnage;
	
	model.update(req,res,function(){
		res.json({"Update ": "1"});
	});
});

// Route supprimant un joueur en particulier
router.delete('/joueur/:idJoueur',function(req,res){
	model.deletePlayer(req,res,function(){
		model.deleteAvancement(req,res,function(){
			var id = req.params.idJoueur;
			model.deleteCombat(id,function(){
				cleanSession(req);
				res.json({"Suppression": "1"});
			});
		});
	});
});

// Route pour un site Web affichant l'ensemble des avancements contenus dans la base de données
router.get('/avancement',function(req,res){
	model.getAllAvancement(req,res,function(docs){
		res.json(docs);
	});
});

// Route affichant l'avancement d'un joueur en particulier
router.get('/avancement/:idJoueur',function(req,res){
	model.getAvancement(req,res,function(doc){
		res.json(doc);
	});
});

router.put('/avancement/:idJoueur',function(req,res){
	model.updateAvancementService(req,res,function(doc){
		res.json({"Update ": "1"});
	});
});

//Route supprimant l'avancement d'un joueur en particulier
router.delete('/avancement/:idJoueur',function(req,res){
	model.deleteAvancement(req,res,function(){
		model.deletePlayer(req,res,function(){
			var id = req.params.idJoueur;
			model.deleteCombat(id,function(){
				cleanSession(req);
				res.json({"Suppression": "1"});
			});
		});
	});
});

// Route pour le service Web Choix Aleatoire
router.get('/choixAleatoire/:pagenum',function(req,res){
	var index = 0;
	// Parcours de tous les pages dans pageAleatoire
	while(choixAleatoire[index].id != req.params.pagenum){
		index++;
		if(index >= choixAleatoire.length){ // Cas où la page n'est pas trouvé
			index = -1;
			break;
		}
	}
	
	// Si la page est bien trouvé alors on renvoie un objet JSON avec l'id de la page aléatoire et le choix aléatoire correspondant.
	if(index != -1){
		var pageAleatoire = choixAleatoire[index];
		var nextPageAleatoire = pageAleatoire.fonction();

		
		res.json({
			id: pageAleatoire.id,
			choixAleatoire: nextPageAleatoire
		});
	} 
	// Sinon on renvoie un objet JSON VIDE
	else {
		console.log("No such page");
		res.json({});
		
	}
});

// Experimental - Permet de verifier les valeurs stockés dans la session
router.get('/session',function(req,res){
	res.json(req.session);
});

module.exports = router;