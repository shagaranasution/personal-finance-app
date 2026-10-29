BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateTable
CREATE TABLE "finance"."AccountOwner" (
    "id" UUID NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,

    CONSTRAINT "AccountOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."BalanceSnapshot" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "current" INTEGER NOT NULL,
    "income" INTEGER NOT NULL,
    "expenses" INTEGER NOT NULL,

    CONSTRAINT "BalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."Pot" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "target" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "theme" VARCHAR(7) NOT NULL,

    CONSTRAINT "Pot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BalanceSnapshot_ownerId_key" ON "finance"."BalanceSnapshot"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Pot_ownerId_theme_key" ON "finance"."Pot"("ownerId", "theme");

-- AddForeignKey
ALTER TABLE "finance"."BalanceSnapshot" ADD CONSTRAINT "BalanceSnapshot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "finance"."AccountOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Pot" ADD CONSTRAINT "Pot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "finance"."AccountOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SQL CHECK constraints are maintained here; Prisma's model syntax cannot express them.
ALTER TABLE "finance"."BalanceSnapshot"
  ADD CONSTRAINT "BalanceSnapshot_nonnegative_amounts"
  CHECK ("current" >= 0 AND "income" >= 0 AND "expenses" >= 0);

ALTER TABLE "finance"."Pot"
  ADD CONSTRAINT "Pot_positive_target" CHECK ("target" > 0),
  ADD CONSTRAINT "Pot_nonnegative_total" CHECK ("total" >= 0),
  ADD CONSTRAINT "Pot_valid_name" CHECK (char_length(btrim("name")) BETWEEN 1 AND 30 AND "name" = btrim("name") AND "name" !~ '^[[:space:]]*$'),
  ADD CONSTRAINT "Pot_palette_theme" CHECK ("theme" IN (
    '#277C78', '#F2CDAC', '#82C9D7', '#626070', '#C94736',
    '#826CB0', '#597C7C', '#93674F', '#934F6F', '#3F82B2',
    '#97A0AC', '#7F9161', '#AF81BA', '#CAB361', '#BE6C49'
  ));

-- Deliberately no total <= target constraint: a savings goal is not a cap.
COMMIT;
