import React from "react";
import "./KindBadge.css";

interface KindBadgeProps {
  kind: string;
}

const KindBadge: React.FC<KindBadgeProps> = ({ kind }) => {
  return <span className="kind-badge">{kind}</span>;
};

export default KindBadge;
