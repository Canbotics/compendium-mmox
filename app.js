var express = require('express');
var mysql = require('mysql');
var app = express();


app.use(express.static(__dirname + '/public'));

app.set('port',(process.env.PORT || 5000));
app.set('views',__dirname + '/pages');
app.set('view engine', 'ejs');

const dataSite = {
	uri:{
		rootSite:'http://mmox.compendium.canbotics.ca',
		rootAsset:'http://asset.canbotics.ca/compendium/',
		rootAssetGlobal:'http://asset.canbotics.ca/global/'},
	en:{
		title:'Compendium',
		game:'MMOX',
		disc:''
	},
	fr:{
		title:'Compendium',
		game:'MMOX',
		disc:'Les traductions sont effectuées en utilisant <a href="https://translate.google.com/" rel="external nofollow">Google Translate</a>.'
	}
};

const dataPage = {
	index:{
		en:{
			title:'Home',
			desc:'',
			uri:'/en'
		},
		fr:{
			title:'Accueil',
			desc:'',
			uri:'/fr'
		}
	},
	
	
	
	area:{
		en:{
			title:'Areas',
			desc:'',
			uri:'/en/areas'
		},
		fr:{
			title:'Domaines',
			desc:'',
			uri:'/fr/domaines'
		}
		
		
	}
};

const dataUnit = {
	second:{
		en:'seconds',
		fr:'secondes'
	},
	minute:{
		en:'minutes',
		fr:'minutes'
	},
	hour:{
		en:'hours',
		fr:'heures'
	}
}










/* =================================== BASE PAGES */
/* ============================================== */
/* ============================================== ROOT LANDING PAGE */
app.get('/',function(request,response) {
	response.render('landing',{dataSite:dataSite});
});

/* ============================================== INDEX */

app.get('/:langCode(en|fr)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'index',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'index',page:'index'},disc:[]};
	var detailRequest = {};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.index) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.index[language].title;
						detailPage.meta.title = dataPage.index[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.index[language].desc;
						
					}
					detailPage.uri[language] = dataPage.index[language].uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	Promise.all([setDetailPage()]).then(() => {
		response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
	}).catch(function(err) {console.log(err);})
});












app.get('/:langCode(en|fr)/:area(areas|domaines)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'area',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'area',page:'area'},disc:[]};
	var detailRequest = {region:{},area:{},regions:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.area) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.area[language].title;
						detailPage.meta.title = dataPage.area[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.area[language].desc;
						
					}
					detailPage.uri[language] = dataPage.area[language].uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryZones(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT area_name, area_uri, area_type_title, area_type_name, region_name, region_uri FROM lib_area INNER JOIN lib_area_lang ON lib_area.area_id = lib_area_lang.area_id INNER JOIN sys_lang ON lib_area_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN lib_area_type ON lib_area.area_type_id = lib_area_type.area_type_id INNER JOIN lib_area_type_lang ON lib_area_type.area_type_id = lib_area_type_lang.area_type_id AND lib_area_type_lang.lang_id = lib_area_lang.lang_id INNER JOIN lib_region ON lib_area.region_id = lib_region.region_id INNER JOIN lib_region_lang ON lib_region.region_id = lib_region_lang.region_id AND lib_region_lang.lang_id = lib_area_lang.lang_id ORDER BY region_order, region_title, area_type_order, area_title',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);
				
				
				results.forEach(function(rsQuery){
					if (detailRequest.region[rsQuery.region_name] == undefined){
						detailRequest.region[rsQuery.region_name] = {name:rsQuery.region_name,uri:rsQuery.region_uri,areas:[]};
						detailRequest.regions.push(detailRequest.region[rsQuery.region_name]);
					}
					detailRequest.area[rsQuery.zone_name] = {name:rsQuery.area_name,uri:rsQuery.area_uri,type:[rsQuery.area_type_title,rsQuery.area_type_name]};
					detailRequest.region[rsQuery.region_name].areas.push(detailRequest.area[rsQuery.zone_name]);
					
				})

				resolve(true);
			})
		})
	}
	

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryZones(cnx)]).then(() => {
			response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});









app.get('/:langCode(en|fr|jp|de)/:thehunt(the-hunt|contrats-de-chasse|mobuhanto|hohe-jagd)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'the-hunt',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'game',game:'ffxiv',page:'thehunt'},disc:[]};
	var detailRequest = {region:{},zone:{},hunt:{},regions:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.thehunt) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.thehunt[language].title;
						detailPage.meta.title = dataPage.thehunt[language].title + ' | Final Fantasy XIV';
						detailPage.meta.desc = dataPage.thehunt[language].desc;
						
					}
					detailPage.uri[language] = dataPage.thehunt[language].uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryHunts(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT hunt_name, hunt_uri, hunt_rank, zone_name, zone_uri, region_name, region_uri FROM lib_hunt INNER JOIN lib_hunt_lang ON lib_hunt.hunt_id = lib_hunt_lang.hunt_id AND lib_hunt_lang.hunt_lang = ? INNER JOIN lib_zone ON lib_hunt.zone_id = lib_zone.zone_id INNER JOIN lib_zone_lang ON lib_zone.zone_id = lib_zone_lang.zone_id AND lib_zone_lang.zone_lang = lib_hunt_lang.hunt_lang INNER JOIN lib_expansion ON lib_zone.expansion_id = lib_expansion.expansion_id INNER JOIN lib_region ON lib_zone.region_id = lib_region.region_id INNER JOIN lib_region_lang ON lib_region.region_id = lib_region_lang.region_id AND lib_region_lang.region_lang = lib_hunt_lang.hunt_lang ORDER BY region_order, region_name, zone_name, hunt_rank, hunt_name',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);

				results.forEach(function(rsQuery){
					if (detailRequest.region[rsQuery.region_name] == undefined){
						detailRequest.region[rsQuery.region_name] = {name:rsQuery.region_name,uri:rsQuery.region_uri,zones:[]};
						detailRequest.regions.push(detailRequest.region[rsQuery.region_name]);
					}
					if (detailRequest.zone[rsQuery.zone_name] == undefined){
						detailRequest.zone[rsQuery.zone_name] = {name:rsQuery.zone_name,uri:rsQuery.zone_uri,b:[],a:[],s:[]};
						detailRequest.region[rsQuery.region_name].zones.push(detailRequest.zone[rsQuery.zone_name]);
					}
					detailRequest.hunt[rsQuery.hunt_name] = {name:rsQuery.hunt_name,uri:rsQuery.hunt_uri,rank:rsQuery.hunt_rank};
					detailRequest.zone[rsQuery.zone_name][rsQuery.hunt_rank.toLowerCase()].push(detailRequest.hunt[rsQuery.hunt_name]);
				})
				
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryHunts(cnx)]).then(() => {
			response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});

app.get('/:langCode(en|fr|jp|de)/:thehunt(the-hunt|contrats-de-chasse|mobuhanto|hohe-jagd)/:uriMark',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'the-hunt-mark',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'game',game:'ffxiv',page:'thehunt'},disc:[]};
	var detailRequest = {name:'',uri:'',rank:'',expansion:'',zone:{name:'',uri:''}};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.thehunt) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = detailRequest.name;
						detailPage.meta.title = detailRequest.name + ' | ' + dataPage.thehunt[language].title + ' | Final Fantasy XIV';
						detailPage.meta.desc = dataPage.thehunt[language].desc;
						
					}
					detailPage.uri[language] = dataPage.thehunt[language].uri + '/' + detailRequest.uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryHunt(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT hunt_name, hunt_uri, hunt_rank, if(hunt_respawn_lower = hunt_respawn_upper, hunt_respawn_lower, CONCAT_WS(" - ", hunt_respawn_lower, hunt_respawn_upper)) AS hunt_respawn, if(hunt_maint_lower IS NULL, NULL, if(hunt_maint_lower = hunt_maint_upper, hunt_maint_lower, CONCAT_WS(" - ", hunt_maint_lower, hunt_maint_upper))) AS hunt_maint, hunt_spawn, zone_name, zone_uri, region_name, region_uri, expansion_name FROM lib_hunt INNER JOIN lib_hunt_lang ON lib_hunt.hunt_id = lib_hunt_lang.hunt_id AND lib_hunt_lang.hunt_lang = ? INNER JOIN lib_zone ON lib_hunt.zone_id = lib_zone.zone_id INNER JOIN lib_zone_lang ON lib_zone.zone_id = lib_zone_lang.zone_id AND lib_zone_lang.zone_lang = lib_hunt_lang.hunt_lang INNER JOIN lib_expansion ON lib_zone.expansion_id = lib_expansion.expansion_id INNER JOIN lib_region ON lib_zone.region_id = lib_region.region_id INNER JOIN lib_region_lang ON lib_region.region_id = lib_region_lang.region_id AND lib_region_lang.region_lang = lib_hunt_lang.hunt_lang WHERE hunt_uri = ?',[request.params.langCode,request.params.uriMark], function (error, results, fields) {
				if (error) reject(error);

				results.forEach(function(rsQuery){
					detailRequest.name = rsQuery.hunt_name;
					detailRequest.uri = rsQuery.hunt_uri;
					detailRequest.rank = rsQuery.hunt_rank;
					detailRequest.respawn = rsQuery.hunt_respawn;
					detailRequest.maint = rsQuery.hunt_maint;
					detailRequest.spawn = rsQuery.hunt_spawn;
					detailRequest.expansion = rsQuery.expansion_name;
					detailRequest.zone.name = rsQuery.zone_name;
					detailRequest.zone.uri = rsQuery.zone_uri;
				})
				
				if (!detailRequest.name.length) {
					detailRequest.name = '404 Not Found';
				}
				
				if (detailRequest.rank == 'B') {
					detailRequest.respawnUnit = dataUnit.second[detailPage.lang];
				} else {
					detailRequest.respawnUnit = dataUnit.hour[detailPage.lang];
				}
				
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		queryHunt(cnx).then(() => {
			setDetailPage().then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});



















			
			
		
		
		
		
		
		












function dataOpen () {
	var dataBase = mysql.createConnection({host:process.env.DATASTORE.split('|')[0],user:process.env.DATASTORE.split('|')[1],password:process.env.DATASTORE.split('|')[2],database:process.env.DATASTORE.split('|')[3]});

	return new Promise(function(resolve,reject) {
		dataBase.connect(function(err) {
			if (err) {
				console.error('Failed to connect to DATASTORE :');
				console.error(err.stack);
				console.error("=====");
				reject(err);
			} else {
				console.log('Connected to DATASTORE : ' + dataBase.threadId);
				resolve(dataBase);
			};
		});
	});
};


/* ================================== APP */
/* ============================================== */
/* ============================================== APP : REQUEST LISTENER */
app.listen(app.get('port'), function() {
	console.log('Compendium ( ' + dataSite.en.game + ' ) is running on port : ', app.get('port'));
});

  