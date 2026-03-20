-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExpenseTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExpenseTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IncomeTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IncomeTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_user_id_key" ON "tags"("name", "user_id");

-- CreateIndex
CREATE INDEX "_ExpenseTags_B_index" ON "_ExpenseTags"("B");

-- CreateIndex
CREATE INDEX "_IncomeTags_B_index" ON "_IncomeTags"("B");

-- CreateIndex
CREATE INDEX "expenses_user_id_description_idx" ON "expenses"("user_id", "description");

-- CreateIndex
CREATE INDEX "incomes_user_id_description_idx" ON "incomes"("user_id", "description");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseTags" ADD CONSTRAINT "_ExpenseTags_A_fkey" FOREIGN KEY ("A") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExpenseTags" ADD CONSTRAINT "_ExpenseTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncomeTags" ADD CONSTRAINT "_IncomeTags_A_fkey" FOREIGN KEY ("A") REFERENCES "incomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncomeTags" ADD CONSTRAINT "_IncomeTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
