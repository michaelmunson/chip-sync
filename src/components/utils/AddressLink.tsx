import { Geo } from "../../utils/location"

interface AddressLinkProps {
    mapChoice:"apple"|"google"
    address:string
}

export function AddressLink({mapChoice,address}:AddressLinkProps){
    const href = Geo.getAddressURL({mapChoice, address});

    const style = {
        color: "var(--mui-primary)",
        textDecoration: "none",
        textAlign: "center"
    }
    
    return (
        <a 
            style={{
                color: "var(--mui-primary)",
                textDecoration: "none",
                textAlign: "center"
            }} 
            href={href} 
            target="_blank" 
            rel="noreferrer">
            {address}
        </a>
    )
}