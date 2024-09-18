

import React from 'react'
import { User } from '../../../types/dataTypes'
import { Button } from '@mui/material'
import { DB } from '../../../utils/database'

interface TrialStartProps {
    userData: User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

function TrialStart({ userData, setUserData }: TrialStartProps) {
    
    const startTrial = async () => {
        await DB.updateOrganization({
            organizationId: userData.organization.id,
            tier: JSON.stringify({
                plan: "trial",
                type: "monthly",
                timestamp: Date.now()
            }) as any
        });
        const newData = {...userData};
        newData.organization.tier.plan = "trial";
        setUserData(newData)
    }
    
    return (
        <div id="trial-start" className='bg-grad' style={{ height: '100vh' }}>
            <h1 style={{ margin: 0, textAlign: 'center', paddingTop: '20px' }}>Start Your Free Trial</h1>
            <p style={{padding:'20px', textAlign:'center'}}>
                Experience the full benefits of our premium services with a 30-day free trial! <br/> <br/>
                Click the button below and enjoy unlimited access to all features and 24/7 customer support, completely risk-free!
            </p>
            <div style={{display:'flex', justifyContent:'center'}}>
                <Button variant="contained" color="success" onClick={startTrial}>
                    Start Trial
                </Button>
            </div>
        </div>
    )
}

export default TrialStart
