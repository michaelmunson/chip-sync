import "../../../css/payment.css"; 
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import payment from "../../../utils/payment";
import { Organization, User } from "../../../types/dataTypes";
import { DB } from "../../../utils/database";
import { HashLoader } from "react-spinners";


const pricingConfig = {
    "exceeder" : 1,
    "plans" : [
        {
            "plan": "Basic",
            "monthly" : 5,
            "annually" : 3,
            "features" : [
                "5 employee accounts"
            ]
        },
        {
            "plan" : "Pro",
            "monthly" : 15,
            "annually" : 10,
            "features" : [
                "20 employee accounts"
            ]
        },
        {
            "plan" : "Enterprise",
            "monthly" : 30,
            "annually": 20,
            "features": [
                "50 employee accounts"
            ]
        }
    ]
}

interface PricingPageProps {
    userData:User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>> 
}

interface PricingCardProps {
    plan: string
    price: number
    features: string[]
    registerPayment(plan:Organization["tier"]["plan"]): void
}

function PriceCard({plan, price, features, registerPayment}:PricingCardProps){
    return (
        <div className='price-card'>
            <div className='plan'>
                <h2><span>{plan}</span></h2>
            </div>
            <div className='price'>
                $<span>{price}</span>/mo
            </div>
            <div className='features'>
                {features.map((feature, index) => {
                    return (
                        <p className='feature' key={`feature-${index}`}>
                            <CheckIcon style={{fontSize:'1.2em', color:"green", marginRight:"10px"}}/> {feature}
                        </p>
                    )
                })}
                <Button 
                    variant="outlined" 
                    color="success" 
                    style={{marginTop:"5px", fontWeight:"bold"}}
                    onClick={() => {
                        registerPayment(plan.toLowerCase() as Organization["tier"]["plan"])
                    }}>
                    Purchase
                </Button>
            </div>
        </div>
    )
}

export default function PricingPage({
    userData,
    setUserData
} : PricingPageProps) {
    const [billingCycle, setBillingCycle] = useState<"monthly"|"annually">("monthly");
    const [isLoading, setIsLoading] = useState<boolean>(false); 

    async function registerPayment(plan:Organization["tier"]["plan"]){
        setIsLoading(true); 
        const registerPaymentRes = await payment.registerPayment({
            organizationId: userData.organization.id,
            tier: {
                plan,
                cycle: billingCycle,
                timestamp: Date.now()
            }
        });
        if (registerPaymentRes !== "native"){
            const newUserData = await DB.getUser();
            if (newUserData)
                setUserData(newUserData);
            setIsLoading(false);
        }
    }

    if (isLoading) return (
        <div className="bg-grad" style={{
            height:"100%",
            width:"100%",
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        }}>
            <HashLoader size={100} color="green"/>
        </div>
    )

    return (
        <div id="payment" className="bg-grad">
            <div style={{marginTop:"30px"}}>
                <h1 className='header'>Pricing Plans</h1>
            </div>
            <div>
                <ButtonGroup>
                    <Button onClick={() => setBillingCycle("monthly")} variant={billingCycle === "monthly" ? "contained" : "outlined"} color='success'>Monthly</Button>
                    <Button onClick={() => setBillingCycle("annually")} variant={billingCycle === "annually" ? "contained" : "outlined"} color='success'>Annually</Button>
                </ButtonGroup>
            </div>
            <div className='price-card-container space-between'>
                {pricingConfig.plans.map((data,index) => {
                    return (
                        <PriceCard
                            key={`pricing-card-key-${index}`}
                            plan={data.plan}
                            price={data[billingCycle]}
                            registerPayment={registerPayment}
                            features={data.features}
                        />
                    )
                })}
            </div>
            <div>
                <p className='pricing-disclaimer'>
                    <b style={{color:"darkred"}}>*</b> Employee accounts that exceed plan alotment are charged at <wbr/> <b>${pricingConfig.exceeder} / employee / mo</b>
                </p>
            </div>
        </div>
    )
}