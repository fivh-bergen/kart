import { writable } from "svelte/store";
import type { CategoryName } from "../utils/category";

export const selectedCategories = writable<CategoryName[]>([]);
