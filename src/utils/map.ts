import { AnyObject } from "../types/generalTypes";

export const lightStyle = [
	{
		"featureType": "administrative",
		"elementType": "geometry",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "poi",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "road",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "transit",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	}
];
export const darkStyle = [
	{
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#212121"
			}
		]
	},
	{
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#757575"
			}
		]
	},
	{
		"elementType": "labels.text.stroke",
		"stylers": [
			{
				"color": "#212121"
			}
		]
	},
	{
		"featureType": "administrative",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#757575"
			},
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "administrative.country",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#9e9e9e"
			}
		]
	},
	{
		"featureType": "administrative.land_parcel",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "administrative.locality",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#bdbdbd"
			}
		]
	},
	{
		"featureType": "poi",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "poi",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#757575"
			}
		]
	},
	{
		"featureType": "poi.park",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#181818"
			}
		]
	},
	{
		"featureType": "poi.park",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#616161"
			}
		]
	},
	{
		"featureType": "poi.park",
		"elementType": "labels.text.stroke",
		"stylers": [
			{
				"color": "#1b1b1b"
			}
		]
	},
	{
		"featureType": "road",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#2c2c2c"
			}
		]
	},
	{
		"featureType": "road",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "road",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#8a8a8a"
			}
		]
	},
	{
		"featureType": "road.arterial",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#373737"
			}
		]
	},
	{
		"featureType": "road.highway",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#3c3c3c"
			}
		]
	},
	{
		"featureType": "road.highway.controlled_access",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#4e4e4e"
			}
		]
	},
	{
		"featureType": "road.local",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#616161"
			}
		]
	},
	{
		"featureType": "transit",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "transit",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#757575"
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [
			{
				"color": "#000000"
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#3d3d3d"
			}
		]
	}
];
export const mapHoldData:AnyObject = {
	interval : null,
	timer: 0,
	timerThreshold: 1000
};
export const activeInfoWindow:AnyObject = {
	infoWindow : null,
	put(infoWindow:any){
		this.infoWindow = infoWindow;
	},
	close(){
		if (this.infoWindow){
			this.infoWindow.close()
			this.infoWindow = null;
		}
	}
}
export const holdingArrowAnimation:AnyObject = {
	on: true,
	size : 50,
	element : null,
	create({x,y}:{x:number,y:number}){
		if (this.on && !this.element){
			const arrow:any = document.createElement("img");
			arrow.src = "https://www.iconarchive.com/download/i103443/paomedia/small-n-flat/map-marker.1024.png"
			arrow.classList = "map-hold-circle fall"
			arrow.style = `
				position:absolute;
				left:${x-(this.size/2)}px;
				top:${y-(this.size/2)-30}px;
				height:${this.size}px;
				width:${this.size}px;
			`;
			document.body.append(arrow);
			this.element = arrow;
		}
	},
	destroy(){
		if (this.element){
			this.element.remove();
			this.element = null;
		}
	}
}
export const getMapOptions = ({latitude,longitude}:{latitude:number,longitude:number}) => {
    return {
        center: {
            lat: latitude,
            lng: longitude
        },
        zoom: 13,
        minZoom: 6,
        gestureHandling:"greedy",
        mapId: "4504f8b37365c3d0",
        disableDefaultUI: true,
        mapTypeControlOptions: {
            mapTypeIds: ["styled_map"],
        },
    };
}
export const clearHold = () => {
    mapHoldData.timer = 0;
    if (mapHoldData.interval) {
        clearInterval(mapHoldData.interval);
        mapHoldData.interval = null;
    }
    holdingArrowAnimation.destroy(); 
}