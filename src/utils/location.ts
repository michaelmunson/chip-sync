import _zipcodes from "../data/zipcodes.json"

const zipcodes = _zipcodes as {[key:string]:{
    LAT:any,
    LNG:any
}};

interface LocationObject {
    street?:string
    city?:string
    state?:string
    zip?:string
}

export const GovGeo = {
    async getCoords(location?:LocationObject){
        const url = 'https://geocoding.geo.census.gov/geocoder/locations/address?street=4600+Silver+Hill+Rd&city=Washington&state=DC&benchmark=2020&format=json';
        return await fetch(url, {
            
        }); 
    }
}

export const Geo = {
    async getCurrentLocation(){

    },
    zipToCoords(zipcode:string){
        const {LAT,LNG} = zipcodes[zipcode]; 
        return {
            latitude: parseFloat(LAT),
            longitude: parseFloat(LNG)
        }
    }
}