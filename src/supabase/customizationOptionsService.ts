import { supabase } from "./supabase";
import { Tables } from "./supabaseTypes";

export async function getAllCustomizationOptions() {
  const { data: customization_options, error } = await supabase
    .from("customization_options")
    .select("*");

  if (error) {
    throw new Error("Error fetching customization options " + error.message);
  }

  return customization_options;
}

export async function getCustomizationOptionsByCategory(category: string) {
  const { data: customization_options, error } = await supabase
    .from("customization_options")
    .select("*")
    .eq("category", category);

  if (error) {
    throw new Error(
      "Error fetching customization options by category " + error.message,
    );
  }

  return customization_options;
}