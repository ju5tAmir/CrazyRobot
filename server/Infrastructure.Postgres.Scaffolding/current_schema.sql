-- This schema is generated based on the current DBContext. Please check the class Seeder to see.
CREATE TABLE "Groups" (
    "Id" text NOT NULL,
    CONSTRAINT "PK_Groups" PRIMARY KEY ("Id")
);


CREATE TABLE "Users" (
    "Id" text NOT NULL,
    "Email" text NOT NULL,
    "Hash" text NOT NULL,
    "Salt" text NOT NULL,
    "Role" text NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);


CREATE TABLE "GroupUser" (
    "GroupsId" text NOT NULL,
    "UsersId" text NOT NULL,
    CONSTRAINT "PK_GroupUser" PRIMARY KEY ("GroupsId", "UsersId"),
    CONSTRAINT "FK_GroupUser_Groups_GroupsId" FOREIGN KEY ("GroupsId") REFERENCES "Groups" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_GroupUser_Users_UsersId" FOREIGN KEY ("UsersId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);


CREATE INDEX "IX_GroupUser_UsersId" ON "GroupUser" ("UsersId");


