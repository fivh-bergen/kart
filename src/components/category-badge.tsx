import React from "react";
import "./category-badge.css";

import { categories } from "../utils/category";

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const cat = categories.find((c) => c.name === category);
  return <span className="category-badge">{cat ? cat.label : category}</span>;
};

export default CategoryBadge;
