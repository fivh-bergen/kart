import React from "react";
import "./DesignationBadge.css";
import { getDesignationLabel } from "../utils/designation";

interface DesignationBadgeProps {
  designation: string;
}

const DesignationBadge: React.FC<DesignationBadgeProps> = ({ designation }) => {
  return (
    <span className="designation-badge">
      {getDesignationLabel(designation)}
    </span>
  );
};

export default DesignationBadge;
