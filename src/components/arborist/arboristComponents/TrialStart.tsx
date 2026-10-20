import React, { useState } from 'react'
import { User } from '../../../types/dataTypes'
import { Alert, Button, CircularProgress } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { DB } from '../../../utils/database'
import Logo from '../../utils/Logo'

interface TrialStartProps {
    userData: User,
    setUserData: React.Dispatch<React.SetStateAction<User | undefined>>
}

const FEATURES = [
    "Unlimited drop site mapping",
    "Crew invites with access codes",
    "Activity feed and notifications",
];

function TrialStart({ userData, setUserData }: TrialStartProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const startTrial = async () => {
        setLoading(true);
        setError("");
        try {
            await DB.updateOrganization({
                organizationId: userData.organization.id,
                tier: JSON.stringify({
                    plan: "trial",
                    type: "monthly",
                    timestamp: Date.now()
                }) as any
            });
            setUserData({
                ...userData,
                organization: {
                    ...userData.organization,
                    tier: { ...userData.organization.tier, plan: "trial" }
                }
            });
        } catch (e) {
            console.error(e);
            setError("We couldn't start your trial. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div id="trial-start">
            <div className="trial-card">
                <Logo size="small" />
                <div className="trial-badge">30-day trial</div>
                <h1>Start free. Stay organized.</h1>
                <p>
                    Full access to drop sites, crew sync, and activity — no charge for 30 days.
                </p>
                <ul className="trial-features">
                    {FEATURES.map(feature => (
                        <li key={feature}>
                            <CheckIcon />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{error}</Alert>}
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                    onClick={startTrial}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    {loading ? "Starting…" : "Start free trial"}
                </Button>
            </div>
        </div>
    )
}

export default TrialStart
