import "../../../css/payment.css"; 
import React, { useState } from 'react';
import { Button, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import payment from "../../../utils/payment";
import { Organization, User } from "../../../types/dataTypes";
import { DB } from "../../../utils/database";


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
                $<span>{price}</span><small>/mo</small>
            </div>
            <div className='features'>
                {features.map((feature, index) => {
                    return (
                        <p className='feature' key={`feature-${index}`}>
                            <CheckIcon className="feature-check" /> {feature}
                        </p>
                    )
                })}
                <Button 
                    variant={plan === "Pro" ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => {
                        registerPayment(plan.toLowerCase() as Organization["tier"]["plan"])
                    }}>
                    {plan === "Pro" ? "Get Pro" : "Purchase"}
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
        <div className="pricing-loading">
            <CircularProgress size={48} />
            <span>Setting up billing</span>
        </div>
    )

    return (
        <div id="payment">
            <div className="pricing-header">
                <h1>Choose your plan</h1>
                <p>Scale seats as your crew grows. Cancel anytime.</p>
            </div>
            <div className="billing-toggle">
                <ToggleButtonGroup
                    exclusive
                    value={billingCycle}
                    onChange={(_, value) => value && setBillingCycle(value)}
                    aria-label="Billing cycle"
                >
                    <ToggleButton value="monthly">Monthly</ToggleButton>
                    <ToggleButton value="annually">Annually</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className='price-card-container'>
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
            <p className='pricing-disclaimer'>
                <b className="disclaimer-mark">*</b> Seats beyond your plan allotment are billed at{" "}
                <b>${pricingConfig.exceeder} / employee / mo</b>
            </p>
        </div>
    )
}
