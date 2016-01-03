var app = angular.module("AppHorsJeu",[]);

Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}

app.controller("ValidationFormulaire",function ValidationController($scope){
	var validationVector= [false,false,false,false,false,false,false,false,false,false];
	var validationVectorItem= [false,false,false,false,false,false,false,false,false,false];
	var nomsBidon = ["Basile le p'tit zouave","Jean-Ma Papa le gros méchant","Eric Babouin","Pierro Lucien", "Oui Oui"]
	var validation = 0;
	var validationItem = 0;
	$scope.isValid = false;
	
	$scope.validationTagItem = false;
	$scope.validationTag = false;
	
	var random = Math.floor(5*Math.random());
	
	$scope.creation ={"name" : nomsBidon[random]};
	
	$scope.updateName = function(){
		if($scope.creation.name != ""){
			if(validationItem == 2 && validation == 5){
				$scope.isValid = true;
			}
		} else {
			$scope.isValid = false;
		}
	}
	
	$scope.update = function(index) {
		if(validationVector[index]){
			validation = validation - 1;
			validationVector[index] = false;
		} else {
			validation = validation + 1;
			validationVector[index] = true;
		}
		
		if(validation == 5){
			$scope.validationTag=true;
			if(validationItem == 2 && $scope.creation.name != ""){
				$scope.isValid = true;
			}
		} else {
			$scope.validationTag = false;
			$scope.isValid = false;
		}
	};
	
	$scope.updateItem = function(index) {
		if(validationVectorItem[index]){
			validationItem = validationItem - 1;
			validationVectorItem[index] = false;
		} else {
			validationItem = validationItem + 1;
			validationVectorItem[index] = true;
		}
		
		if(validationItem == 2){
			$scope.validationTagItem=true;
			if(validation == 5 && $scope.creation.name != ""){
				$scope.isValid = true;
			}
		} else {
			$scope.validationTagItem = false;
			$scope.isValid = false;
		}
	};
});

app.controller("ChargementPersonnages",function ChargementSuppression($scope,$http){
	$scope.personnages = [];
	
	$http({
  		method: 'GET',
  		url: '/joueur'
	}).then(function successCallback(response) {
		var data = response.data;
		for(personnage in data){
			$scope.personnages.push(personnage);
			console.log(personnage);
		}
    	
  		}, function errorCallback(response) {
   		console.log(response.data[0]);
   		
   		for(personnage in $scope.personnages){
			console.log(personnage);
		}
  	});
	
	$scope.suppression = function(index) {
		console.log(index);
		$("#"+index).attr("class","invisible");
		$http.delete("/joueur/"+index,[]);
		
	};
});

app.controller("ChargementPage",function ChargementPage($scope,$http){
	var pageActuelle = -1;
	$scope.page = "Chargement page";
	$scope.listeChoix = [];
	$scope.personnage = {};
	$scope.historique = [];
	$scope.bouton = true;
	$scope.isRandom = true;
	$scope.isPertePopupHidden = true;
	$scope.hasEndurancePerdue = false ;
	$scope.listeItems = [];
	$scope.itemsChoisis = [];
	$scope.repas = false;
	$('.swordPicture').attr("class","swordPicture");
	$('.popupPerte').attr("class","invisible");
	$('#victoire').attr("class","invisible");
	$('#differentsItems').attr("class","invisible");
	
	$http({
		method: 'GET',
		url: '/session'
	}).then(function successCallback(response) {
		var page = response.data.page;
		pageActuelle = page;
		var historique = response.data.historique;
		
		$scope.personnage = response.data.personnage;
		
		console.log($scope.personnage);
		if($scope.personnage == null){
			$('#pertePoints').attr("class","popupPerte");
		} else {
		
			$http({
				method: 'GET',
				url: '/page/'+page
			}).then(function successCallback(response) {
				var dead = (response.data.Suppression == 1);
			
				if(dead){
					$('#pertePoints').attr("class","popupPerte");
				}
				
				else{
					$scope.titre = response.data.id;
					$('.jeu').find('p').html(response.data.htmlPage);
					$scope.listeChoix = response.data.choix;
					$scope.listeItems = response.data.isItemPage;
					$scope.historique = historique;
					$scope.repas = response.data.repas;
					
					var infosCombat = response.data.infosCombat;
					
					if(typeof(infosCombat.suite) != "undefined"){
						$('.swordPicture').attr("class","invisible");
						$scope.bouton = false;
					}
					if(response.data.isRandomChoicePage){
						$scope.isRandom = false;
					} else {
						$scope.isRandom = true;
					}
					
					if($scope.listeItems.length == 0){
						$('#differentsItems').attr("class","invisible");
					} else {
						$('#differentsItems').attr("class","popupPerte");
					}
					
					console.log($scope.repas);
					if($scope.repas){
						$('#repas').attr("class","popupPerte");
					} else {
						$('#repas').attr("class","invisible");
					}
					
					$scope.isPertePopupHidden = !response.data.isPerteChoicePage;
					$scope.hasEndurancePerdue = response.data.hasEndurancePerdue;
					
				}
		}, function errorCallback(response) {
			$scope.texte = "DERCH";
			console.log("DERCH");
		});
		}
	}, function errorCallback(response){
		console.log("DERCH");
	});
	
	$scope.utiliserGuerison = function(){
		$scope.hasEndurancePerdue=false;
		$http({
			method: 'GET',
			url: '/utiliserGuerison'
		});
	
	
	}
	
	$scope.chargement = function(index){
		$http({
			method: 'GET',
			url: '/page/'+index
		}).then(function successCallback(response) {
			var dead = (response.data.Suppression == 1);
			
				if(dead){
					$('#pertePoints').attr("class","popupPerte");
				}
				
				else{
			
					var infosCombat = response.data.infosCombat;
					pageActuelle = index;
					$scope.infosCombat = infosCombat;
					$scope.titre = response.data.id;
					$scope.listeChoix = response.data.choix;
					$scope.repas = response.data.repas;
					
					$('#changement').find('p').html(response.data.htmlPage);
					
					if(typeof(infosCombat.suite) != "undefined"){
						$scope.bouton = false;
						$('.swordPicture').attr("class","invisible");
					}
					
					if(response.data.isRandomChoicePage){
						$scope.isRandom = false;
					} else {
						$scope.isRandom = true;
					}
					$scope.isPertePopupHidden = !response.data.isPerteChoicePage;
					$scope.hasEndurancePerdue = response.data.hasEndurancePerdue;
					if($scope.listeItems.length == 0){
						$('#differentsItems').attr("class","invisible");
					} else {
						$('#differentsItems').attr("class","popupPerte");
					}
					
					console.log($scope.repas);
					if($scope.repas){
						$('#repas').attr("class","popupPerte");
					} else {
						$('#repas').attr("class","invisible");
					}
				}
		}, function errorCallback(response) {
			$scope.texte = "DERCH";
		});
	};
	
	$scope.fuir = function(){
		console.log("Fuite");
		$http({
			method: 'GET',
			url: '/fuite'
		}).then(function successCallback(response){
			var dead = (response.data.Suppression == 1);
			
			if(dead){
				$('#pertePoints').attr("class","popupPerte");
			} else {
				var victory = response.data.combat.weak;
				console.log(victory);
				if(victory) {
					$('#victoire').attr("class","victoire");
				} else {
					$('#pertePoints').attr("class","popupPerte");
				}
			}
		}, function errorCallback(response) {
			console.log("DERCH");
		});
	};
	
	$scope.randomPage = function(){
		$http({
			method:'GET',
			url: '/choixAleatoire/'+pageActuelle
		}).then(function successCallback(response){
			var index = response.data.choixAleatoire;
			$scope.chargement(index);
		}, function errorCallback(response) {
			console.log("DERCH");
		});	
	};
	
	$scope.okrepas = function(){
		$('#repas').attr("class","invisible");
	}
	
	$scope.goItem = function(index){
		if(index == 0){
			var type = $scope.listeItems[0].type;
			if(type == "special"){
				if(!$scope.personnage.listeSpeciale.contains($scope.listeItems[0].item)){
					$scope.personnage.listeSpeciale.push($scope.listeItems[0].item);
				}
			} else if(type == "sac"){
				if(!$scope.personnage.listeItems.contains($scope.listeItems[0].item)){
					$scope.personnage.listeItems.push($scope.listeItems[0].item);
				}
			} else {
				if(!$scope.personnage.listeArmes.contains($scope.listeItems[0].item)){
					$scope.personnage.listeArmes.push($scope.listeItems[0].item);
				}
			}
		
			$http({
				method:'PUT',
				url: '/joueur/'+$scope.personnage._id,
				data: {player: {listeSpeciale: $scope.personnage.listeSpeciale, listeItems: $scope.personnage.listeItems, listeArmes: $scope.personnage.listeArmes}}
			}).then(function successCallback(response){
				console.log(response.data);
			}, function errorCallback(response) {
				console.log("DERCH");
			});
		
			$('#differentsItems').attr("class","invisible");
		} else {
			var i = 0;
			for(i=0;i<$scope.itemsChoisis.length;i++){
				var tmp = $scope.itemsChoisis[i];
				
				if(tmp.type == "special"){
					if(!$scope.personnage.listeSpeciale.contains(tmp.item)){
						$scope.personnage.listeSpeciale.push(tmp.item);
					}
				} else if(tmp.type == "sac"){
					if(!$scope.personnage.listeItems.contains(tmp.item)){
						$scope.personnage.listeItems.push(tmp.item);
					}
				} else {
					if(!$scope.personnage.listeArmes.contains(tmp.item)){
						$scope.personnage.listeArmes.push(tmp.item);
					}
				}
			}
			
			$http({
				method:'PUT',
				url: '/joueur/'+$scope.personnage._id,
				data: {player: {listeSpeciale: $scope.personnage.listeSpeciale, listeItems: $scope.personnage.listeItems, listeArmes: $scope.personnage.listeArmes}}
			}).then(function successCallback(response){
				console.log(response.data);
			}, function errorCallback(response) {
				console.log("DERCH");
			});
		
			$('#differentsItems').attr("class","invisible");
		}	
	};
	
	$scope.update = function(item){
		if(!$scope.itemsChoisis.contains(item)){
			$scope.itemsChoisis.push(item);
		} else {
			var i =0;
			var tmp = [];
			
			for(i=0;i<$scope.itemsChoisis.length;i++){
				if($scope.itemsChoisis[i] != item){
					tmp.push($scope.itemsChoisis[i]);
				}
			}
			
			$scope.itemsChoisis = tmp;
		}
	};
	
	$scope.nopeItem = function(index){
		console.log("Tu peux te la garder ta merde de "+$scope.listeItems[index]);
		$('#differentsItems').attr("class","invisible");
	};
});

app.controller("ControllerCombat",function ControllerCombat($scope,$http){
	$scope.rounds = [];
	$scope.personnage = {};
	$scope.ennemy = {};
	$scope.PuissancePsy = false;
	
	$('.popupPerte').attr("class","invisible");
	$('#victoire').attr("class","invisible");
	$('.ennemyPicture').attr("src","/images/ennemy/"+$scope.ennemy.name+".jpg");
	
	$http({
		method:'GET',
		url:'/session'
	}).then(function successCallback(response){
		var historique = response.data.historique;
		$scope.personnage = response.data.personnage;
		$scope.ennemy = response.data.combat.ennemy;
		$('.ennemyPicture').attr("src","/images/ennemy/"+$scope.ennemy.name+".jpg");
		$scope.rounds = response.data.combat.rounds;
		$scope.historique = historique;
		$scope.PuissancePsy = response.data.PuissancePsy;
	},function errorCallback(response){
		console.log("DERCH");
	});
	
	
	$scope.utiliserPuissancePsy = function(){
		$scope.PuissancePsy = false;
		$('#PuissancePsy').attr("ng-disabled","true;");
		$http({
			method: 'GET',
			url: '/PuissancePsy'
		});
	
	}
	$scope.attaquer = function(){
		$http({
			method: 'GET',
			url: '/attaque'
		}).then(function successCallback(response){
			var dead = (response.data.Suppression == 1);
			
			if(dead){
				$('#pertePoints').attr("class","popupPerte");
			} else {
				var victory = response.data.combat.success;
				if(victory) {
					$('#victoire').attr("class","victoire");
				} else {
					$scope.personnage = response.data.personnage;
					$scope.rounds = response.data.combat.rounds;
					$scope.ennemy = response.data.combat.ennemy;
					
					if($scope.ennemy.endurance < 0){
						$scope.ennemy.endurance = "Dead ;)";
					}
				}
			}
		}, function errorCallback(response) {
			console.log("DERCH");
		});
	};
	
	$scope.fuir = function(){
		console.log("Fuite");
		$http({
			method: 'GET',
			url: '/fuite'
		}).then(function successCallback(response){
			var dead = (response.data.Suppression == 1);
			
			if(dead){
				$('#pertePoints').attr("class","popupPerte");
			} else {
				var victory = response.data.personnage.weak;
				console.log(victory);
				if(victory) {
					$('#victoire').attr("class","victoire");
				} else {
					$('#pertePoints').attr("class","popupPerte");
				}
			}
		}, function errorCallback(response) {
			console.log("DERCH");
		});
	};
});

