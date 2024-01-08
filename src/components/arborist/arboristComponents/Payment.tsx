import "../../../css/payment.css"; 
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import payment from "../../../utils/payment";
import { Organization } from "../../../types/dataTypes";

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

interface PricingCardProps {
    plan: string
    price: number
    cycle: "monthly"|"annually"
    features: string[]
}

function PriceCard({plan, price, features, cycle}:PricingCardProps){
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
                        payment.registerPayment({
                            plan: (plan.toLowerCase() as Organization["tier"]["plan"]),
                            cycle,
                            timestamp: Date.now()
                        })
                    }}>
                    Purchase
                </Button>
            </div>
        </div>
    )
}

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly"|"annually">("monthly");

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
                            plan={data.plan}
                            price={data[billingCycle]}
                            cycle={billingCycle}
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