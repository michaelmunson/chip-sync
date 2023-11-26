import _zipcodes from "../data/zipcodes.json";
import { Coordinates } from "../types/generalTypes";
import { Loader } from '@googlemaps/js-api-loader';
import { getGoogleMapsApiKey } from "./secrets";

const zipcodes = _zipcodes as {[key:string]:{
    LAT:any,
    LNG:any
}};

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
    }
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

