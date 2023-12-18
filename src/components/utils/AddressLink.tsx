import { Button } from "@mui/material";
import { Geo } from "../../utils/location"

interface AddressLinkProps {
    mapChoice:"apple"|"google"
    address:string
}

export function AddressLink({mapChoice,address}:AddressLinkProps){
    const href = Geo.getAddressURL({mapChoice, address});

    return (
        <Button
            style={{
                textAlign:"center",
                textTransform:"none",
                fontSize:"1rem"
            }}
            variant="text"
            href={href} 
            target="_blank" 
            rel="noreferrer"
            autoCapitalize="none">
            {address.split(",")[0]}
            <br/>
            {address.split(",").slice(1).join(",")}
        </Button>
    )
}