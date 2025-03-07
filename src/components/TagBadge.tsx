import React from "react";
import "./TagBadge.css";

interface TagBadgeProps {
  tag: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  return <span className="tag-badge">{tag}</span>;
};

export default TagBadge;
