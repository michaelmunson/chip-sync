import { Geo } from "../../utils/location"

interface AddressLinkProps {
    mapChoice:"apple"|"google"
    address:string
}

export function AddressLink({mapChoice,address}:AddressLinkProps){
    const href = Geo.getAddressURL({mapChoice, address});
    
    return <a href={href} target="_blank" rel="noreferrer">{address}</a>
}