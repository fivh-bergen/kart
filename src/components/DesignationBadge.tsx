import React from "react";
import "./DesignationBadge.css";

interface DesignationBadgeProps {
  tag: string;
}

const DesignationBadge: React.FC<DesignationBadgeProps> = ({ tag }) => {
  return <span className="tag-badge">{tag}</span>;
};

export default DesignationBadge;
