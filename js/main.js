// declare the map variable here to give it a global scope
let myMap;

// Gloabl variable to hold map id
let currentMapID = null;

// we might as well declare our baselayer(s) here too
const CartoDB_Positron = L.tileLayer(
	'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
	{
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
	}
);

// Adding ESRI World Imagery basemap here as I had the url handy from my term project code
const Esri_WorldImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri'
    }
);

//add the basemap style(s) to a JS object, to which you could also add other baselayers. This object is loaded as a basemap selector as seen further down
let baseLayers = {
	"CartoDB": CartoDB_Positron,
	"ESRI World Imagery": Esri_WorldImagery
};

function initialize(){
    loadMap();
};

function loadMap(mapid){
	// check which map is loaded
	console.log("mapdid is:" , mapid);
	currentMapID = mapid;	// update global variable

	try {
		myMap.remove()
	} catch(e) {
		console.log(e)
		console.log("no map to delete")
	} finally {
		
		// Select map id and which data set to be loaded
		if (mapid == 'mapa') {

			//now reassign the map variable by actually making it a useful object, this will load your leaflet map
			myMap = L.map('mapdiv', {
				center: [46.58, -78.19]
				,zoom: 5
				,maxZoom: 18
				,minZoom: 3
				,layers: CartoDB_Positron
			});
			
			var mapurl = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/refs/heads/main/DATA/train-stations.geojson"
		
		} else if (mapid == 'mapb') {
			
			myMap = L.map('mapdiv', {
				center: [31, -7]
				,zoom: 3
				,maxZoom: 18
				,minZoom: 3
				,layers: CartoDB_Positron
			});

			var mapurl = "https://raw.githubusercontent.com/brubcam/GEOG-464_Lab-7/refs/heads/main/DATA/megacities.geojson"
		
		} else {
			console.warn("Unknown mapid:", mapid);
        	return;	
		}

	//declare basemap selector widget
	let lcontrol = L.control.layers(baseLayers);
	//add the widget to the map
	lcontrol.addTo(myMap);

	function fetchData(mapurl){
		//load the data
		fetch(mapurl)
			.then(function(response){
				return response.json();
			})
			.then(function(json){
				//create a Leaflet GeoJSON layer using the fetched json and add it to the map object
				// stly and pointToLayer options are set to use functions defined further down
				L.geoJson(json, { 
					style: styleAll,
					pointToLayer: generateCircles,
					onEachFeature: addPopups
				}).addTo(myMap);
			})
	};
	//call the fetch data function with the URL to the geojson file
	fetchData(mapurl);
	}
}

// function to add popups to each feature
function addPopups(feature, layer) {
	if (currentMapID == 'mapa') {
		layer.bindPopup("Station ID: " + feature.properties.stat_ID + "</b><br>" +
			"Station Name: " + feature.properties.stat_name + "</b><br>" + 
			"City: " + feature.properties.city);
	
	} else if (currentMapID == 'mapb') {
		layer.bindPopup(feature.properties.City + "</b><br>" +
            "Population: " + feature.properties.Population);
	}
}

// function to generate circle markers for point features 
function generateCircles(feature, latlng) {
	return L.circleMarker(latlng);
}

function styleAll(feature, latlng) {

	console.log("Station ID:", feature.properties.stat_ID);
	
	var styles = {dashArray:null, dashOffset:null, lineJoin:null, lineCap:null, stroke:false, color:'#000',
		 			opacity:1, weight:1, fillColor:null, fillOpacity:0 };

	if (feature.geometry.type == "Point") {
		styles.fillColor = '#fff'
		,styles.fillOpacity = 0.5
		,styles.stroke=true
		,styles.radius=9
	}
	
	// MAP A: train stations symbology
    if (currentMapID === "mapa") {
        console.log("Station ID:", feature.properties.stat_ID);

        // default station style
        styles.fillColor = '#fff';
        styles.fillOpacity = 0.5;
		styles.radius = 5;
		styles.fillColor = 'grey';

        // highlight stations that have a postal code
        if (feature.properties.postal_code !== "") {
            styles.fillColor = 'cyan';
        }
    }
	
	// MAP B: megacities symbology
    else if (currentMapID === "mapb") {
        const pop = feature.properties.Population;

        // graduated symbology by population size
        if (pop >= 25000000) {
            styles.fillColor = 'red';
            styles.radius = 18;
        } else if (pop >= 18000000) {
            styles.fillColor = 'orange';
            styles.radius = 14;
        } else {
            styles.fillColor = 'yellow';
            styles.radius = 10;
        }

        styles.fillOpacity = 0.5;
    }

	return styles;
}

// Add event listener to call initialize function on window load
// at the bottom of main.js (after your function definitions)
document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.getElementById("mapdropdown");
    console.log("dropdown is:", dropdown); // should NOT be null

    if (!dropdown) {
        console.error("No element with id 'mapdropdown' found.");
        return;
    }

    dropdown.addEventListener("change", function (event) {
        const mapid = event.target.value; // "mapa" or "mapb"
        console.log("Dropdown selected:", mapid);
        loadMap(mapid);
    });
});
