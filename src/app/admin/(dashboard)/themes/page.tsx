import prisma from "@/lib/prisma";
import ThemeManagementClient from "./ThemeManagementClient";

export const metadata = {
  title: "App Theme Management | BrandBoost AI",
  description: "Manage global application themes and color palettes.",
};

async function getThemes() {
  const themes = await prisma.$queryRaw`SELECT 
    id, 
    name, 
    primary_color as "primaryColor", 
    secondary_color as "secondaryColor", 
    dark_primary_color as "darkPrimaryColor", 
    dark_secondary_color as "darkSecondaryColor", 
    is_active as "isActive", 
    is_default as "isDefault", 
    created_at as "createdAt"
  FROM app_themes 
  ORDER BY created_at DESC`;
  return themes;
}

export default async function ThemesPage() {
  const rawThemes = await getThemes();
  
  // Explicitly map fields to ensure they exist for the client component
  const themes = rawThemes.map((t: any) => ({
    ...t,
    id: t.id.toString(), // Pre-convert ID to string
    isActive: t.isActive ?? t.is_active ?? true,
    isDefault: t.isDefault ?? t.is_default ?? false,
  }));
  
  return <ThemeManagementClient initialThemes={themes} />;
}
