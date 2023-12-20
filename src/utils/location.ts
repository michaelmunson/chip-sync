import zips from "../data/zipcodes.json";
import { Coordinates } from "../types/generalTypes";
import { Loader } from '@googlemaps/js-api-loader';
import { getGoogleMapsApiKey } from "./secrets";
const zipcodes = zips as {[key:string]:{
    LAT:any,
    LNG:any
}};

namespace GeoTypes {
    export type Unit = "mi" | "km" | "ft"
}

const convertFromMiles = (miles:number, unit:GeoTypes.Unit) => ({mi:1,ft:5280,km:1.60934}[unit]) * miles;

export const Geo = {
    getCurrentLocation():Promise<Coordinates>{
        return new Promise((resolve,reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error)
            );
        })
    },
    zipcodeToCoordinates(zipcode:string):Coordinates{
        const {LAT,LNG} = zipcodes[zipcode]; 
        return {
            latitude: parseFloat(LAT),
            longitude: parseFloat(LNG)
        }
    },
    getAddressURL({mapChoice,address}:{mapChoice:"apple"|"google", address:string}){
        if (mapChoice === "google") {
            const url = new URL(`https://www.google.com/maps/search/?api=1&query=${address}`)
            return url.href;
        } else {
            const url = new URL(`http://maps.apple.com/?address=${address}`)
            return url.href;
        }
    },
    distance(coords1:Coordinates, coords2:Coordinates, unit:GeoTypes.Unit="mi") : number {
        const {latitude:lat1, longitude:lon1} = coords1;
        const {latitude:lat2, longitude:lon2} = coords2;
        if ((lat1 === lat2) && (lon1 === lon2)) {
            return 0;
        }
        else {
            let radlat1 = Math.PI * lat1 / 180;
            let radlat2 = Math.PI * lat2 / 180;
            let theta = lon1 - lon2;
            let radtheta = Math.PI * theta / 180;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            return convertFromMiles(dist, unit);
        }
    },
    async getPredictionFunction({latitude, longitude}:Coordinates):Promise<()=>Promise<string[]>>{
        const apiKey = await getGoogleMapsApiKey();
        const loader = new Loader({
            apiKey,
            version:"weekly"
        });
        const {AutocompleteService} = await loader.importLibrary("places");
    
        const service = new AutocompleteService(); 
    
        const fn:any = (input:string) => {
            const p:any =  new Promise((resolve,reject) => {
                service.getPlacePredictions({ 
                    input,
                    locationBias: {
                      radius: 100,
                      center : {
                        lat : latitude,
                        lng : longitude
                      }
                    }
                }, (predictions:any, status:any) => {
                    predictions = predictions.map((pred:any) => pred.description);
                    resolve(predictions);
                });
            });
            return p; 
        }
        return fn; 
    },
    async addressToCoords(address:string):Promise<Coordinates>{
        const key = await getGoogleMapsApiKey();
        const url = new URL(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`);
        const href = url.href;
        let res:any = await fetch(href);
        res = await res.json();
        const {lat:latitude, lng:longitude} = res.results[0].geometry.location;
        return {latitude, longitude}; 
    },
    
}

/* interface LocationObject {
    street?:string
    city?:string
    state?:string
    zip?:string
}

export const GovGeo = {
    async getCoords(location?:LocationObject){
        const url = 'https://geocoding.geo.census.gov/geocoder/locations/address?street=4600+Silver+Hill+Rd&city=Washington&state=DC&benchmark=2020&format=json';
        
    }
} */

