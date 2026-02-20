import React from "react";
import "./DesignationBadge.css";
import { getDesignationLabel, type Designation } from "../utils/designation";

interface DesignationBadgeProps {
  tag: Designation;
}

const DesignationBadge: React.FC<DesignationBadgeProps> = ({ tag }) => {
  return <span className="tag-badge">{getDesignationLabel(tag)}</span>;
};

export default DesignationBadge;
