import React from 'react';
import './kind-badge.css';

interface KindBadgeProps {
    kind: "repair" | "rental" | "second-hand";
}

const KindBadge: React.FC<KindBadgeProps> = ({ kind }) => {

    if (kind === 'repair') {
        return <span className="kind-badge">
            Reparasjon
        </span>
    } else if (kind === 'rental') {
        return (
            <span className="kind-badge">
                Utleie
            </span>
        );
    } else {
        return (
            <span className="kind-badge">
                Gjenbruk
            </span>
        );
    }
    
};

export default KindBadge;