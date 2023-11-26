import _zipcodes from "../data/zipcodes.json";
import { Coordinates } from "../types/generalTypes";

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
    zipToCoords(zipcode:string){
        const {LAT,LNG} = zipcodes[zipcode]; 
        return {
            latitude: parseFloat(LAT),
            longitude: parseFloat(LNG)
        }
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

