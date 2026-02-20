import React from "react";
import "./category-badge.css";

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return <span className="category-badge">{category}</span>;
};

export default CategoryBadge;
