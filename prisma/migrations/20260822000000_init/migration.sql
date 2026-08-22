-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "requiresValidity" BOOLEAN NOT NULL DEFAULT false,
    "validityDays" INTEGER NOT NULL DEFAULT 0,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ventana" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Ventana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAcceso" (
    "userId" INTEGER NOT NULL,
    "ventanaId" INTEGER NOT NULL,

    CONSTRAINT "UserAcceso_pkey" PRIMARY KEY ("userId","ventanaId")
);

-- CreateTable
CREATE TABLE "HelpType" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttentionArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttentionArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "areaId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequirement" (
    "id" SERIAL NOT NULL,
    "helpTypeId" INTEGER NOT NULL,
    "requirementId" INTEGER NOT NULL,

    CONSTRAINT "HelpRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ventana_clave_key" ON "Ventana"("clave");

-- CreateIndex
CREATE INDEX "HelpType_categoryId_idx" ON "HelpType"("categoryId");

-- CreateIndex
CREATE INDEX "Visitor_areaId_idx" ON "Visitor"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpRequirement_helpTypeId_requirementId_key" ON "HelpRequirement"("helpTypeId", "requirementId");

-- CreateIndex
CREATE INDEX "HelpRequirement_helpTypeId_idx" ON "HelpRequirement"("helpTypeId");

-- CreateIndex
CREATE INDEX "HelpRequirement_requirementId_idx" ON "HelpRequirement"("requirementId");

-- AddForeignKey
ALTER TABLE "UserAcceso" ADD CONSTRAINT "UserAcceso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcceso" ADD CONSTRAINT "UserAcceso_ventanaId_fkey" FOREIGN KEY ("ventanaId") REFERENCES "Ventana"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpType" ADD CONSTRAINT "HelpType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AttentionArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequirement" ADD CONSTRAINT "HelpRequirement_helpTypeId_fkey" FOREIGN KEY ("helpTypeId") REFERENCES "HelpType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequirement" ADD CONSTRAINT "HelpRequirement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
