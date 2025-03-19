-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "name_user" CHAR(20) NOT NULL,
    "first_name_user" CHAR(20) NOT NULL,
    "username_user" CHAR(20),
    "phone_user" CHAR(10),
    "pwd_user" VARCHAR(255) NOT NULL,
    "date_birthday_user" DATE,
    "email_user" CHAR(50) NOT NULL,
    "date_inscription" DATE,
    "description_user" CHAR(255),
    "id_role" INTEGER NOT NULL,
    "id_house" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id_role" SERIAL NOT NULL,
    "name_role" CHAR(20) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "houses" (
    "id_house" SERIAL NOT NULL,
    "name_house" CHAR(64) NOT NULL,
    "adress" CHAR(255),
    "city" CHAR(64),
    "postal_code" CHAR(10),
    "country" CHAR(64),
    "description_house" CHAR(255),

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id_house")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_user_key" ON "users"("phone_user");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_user_key" ON "users"("email_user");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_role_key" ON "user_roles"("name_role");

-- CreateIndex
CREATE UNIQUE INDEX "houses_name_house_key" ON "houses"("name_house");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "user_roles"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_house_fkey" FOREIGN KEY ("id_house") REFERENCES "houses"("id_house") ON DELETE SET NULL ON UPDATE CASCADE;
