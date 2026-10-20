import React from 'react';
import Logo from "./Logo";

interface LoaderProps {
    isFullScreen:boolean
}

export default function Loader({isFullScreen}:LoaderProps) {
    const spinner = (
        <Logo type="round" size="xxlarge" className="breath" alt="Chip Sync" />
    );

    if (isFullScreen) return (
        <div className="app-loader" role="status" aria-live="polite">
            {spinner}
            <span>Loading workspace</span>
        </div>
    )

    return spinner;
}
