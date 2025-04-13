-- This schema is generated based on the current DBContext. Please check the class Seeder to see.
DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'crazyrobot') THEN
        CREATE SCHEMA crazyrobot;
    END IF;
END $EF$;


CREATE TABLE crazyrobot."group" (
    id text NOT NULL,
    CONSTRAINT group_pkay PRIMARY KEY (id)
);


CREATE TABLE crazyrobot."user" (
    id text NOT NULL,
    email text NOT NULL,
    hash text NOT NULL,
    salt text NOT NULL,
    role text NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


CREATE TABLE crazyrobot.groupmember (
    groupid text NOT NULL,
    userid text NOT NULL,
    CONSTRAINT groupmember_pk PRIMARY KEY (groupid, userid),
    CONSTRAINT groupmember_group_fk FOREIGN KEY (groupid) REFERENCES crazyrobot."group" (id),
    CONSTRAINT groupmember_user_fk FOREIGN KEY (userid) REFERENCES crazyrobot."user" (id)
);


CREATE TABLE crazyrobot.message (
    messagetext text NOT NULL,
    id text,
    userid text NOT NULL,
    groupid text NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    CONSTRAINT message_group_id_fk FOREIGN KEY (groupid) REFERENCES crazyrobot."group" (id),
    CONSTRAINT message_user_id_fk FOREIGN KEY (userid) REFERENCES crazyrobot."user" (id)
);


CREATE INDEX "IX_groupmember_userid" ON crazyrobot.groupmember (userid);


CREATE INDEX "IX_message_groupid" ON crazyrobot.message (groupid);


CREATE INDEX "IX_message_userid" ON crazyrobot.message (userid);


