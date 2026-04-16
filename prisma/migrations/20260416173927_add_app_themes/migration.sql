-- CreateTable
CREATE TABLE "app_themes" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL,
    "secondary_color" TEXT NOT NULL,
    "dark_primary_color" TEXT NOT NULL,
    "dark_secondary_color" TEXT NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_themes_pkey" PRIMARY KEY ("id")
);
