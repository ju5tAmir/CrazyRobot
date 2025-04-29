-- This schema is generated based on the current DBContext. Please check the class Seeder to see.
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'crazyrobot') THEN
        CREATE SCHEMA crazyrobot;
    END IF;
END $EF$;


CREATE TABLE crazyrobot.contacts (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    department text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    "imageUrl" text,
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
);


CREATE TABLE crazyrobot.events (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    time text NOT NULL,
    location text NOT NULL,
    category text NOT NULL,
    status text NOT NULL,
    CONSTRAINT events_pkey PRIMARY KEY (id)
);


CREATE TABLE crazyrobot."user" (
    id text NOT NULL,
    email text NOT NULL,
    hash text NOT NULL,
    salt text NOT NULL,
    role text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


