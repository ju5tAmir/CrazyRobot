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
    created_date timestamp with time zone NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


CREATE TABLE crazyrobot.survey (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    survey_type text NOT NULL,
    created_by_user_id text NOT NULL,
    is_active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT survey_pkey PRIMARY KEY (id),
    CONSTRAINT fk_survey_user FOREIGN KEY (created_by_user_id) REFERENCES crazyrobot."user" (id) ON DELETE CASCADE
);


CREATE TABLE crazyrobot.question (
    id text NOT NULL,
    survey_id text NOT NULL,
    question_text text NOT NULL,
    question_type text NOT NULL,
    order_number integer NOT NULL,
    CONSTRAINT question_pkey PRIMARY KEY (id),
    CONSTRAINT fk_question_survey FOREIGN KEY (survey_id) REFERENCES crazyrobot.survey (id) ON DELETE CASCADE
);


CREATE TABLE crazyrobot.survey_response (
    id text NOT NULL,
    survey_id text NOT NULL,
    user_id text NOT NULL,
    submitted_at timestamp with time zone NOT NULL,
    CONSTRAINT survey_response_pkey PRIMARY KEY (id),
    CONSTRAINT fk_response_survey FOREIGN KEY (survey_id) REFERENCES crazyrobot.survey (id) ON DELETE CASCADE,
    CONSTRAINT fk_response_user FOREIGN KEY (user_id) REFERENCES crazyrobot."user" (id) ON DELETE CASCADE
);


CREATE TABLE crazyrobot.question_option (
    id text NOT NULL,
    question_id text NOT NULL,
    option_text text NOT NULL,
    order_number integer NOT NULL,
    CONSTRAINT question_option_pkey PRIMARY KEY (id),
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES crazyrobot.question (id) ON DELETE CASCADE
);


CREATE TABLE crazyrobot.answer (
    id text NOT NULL,
    survey_response_id text NOT NULL,
    question_id text NOT NULL,
    answer_text text,
    selected_option_id text,
    CONSTRAINT answer_pkey PRIMARY KEY (id),
    CONSTRAINT fk_answer_option FOREIGN KEY (selected_option_id) REFERENCES crazyrobot.question_option (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES crazyrobot.question (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_response FOREIGN KEY (survey_response_id) REFERENCES crazyrobot.survey_response (id) ON DELETE CASCADE
);


CREATE INDEX "IX_answer_question_id" ON crazyrobot.answer (question_id);


CREATE INDEX "IX_answer_selected_option_id" ON crazyrobot.answer (selected_option_id);


CREATE INDEX "IX_answer_survey_response_id" ON crazyrobot.answer (survey_response_id);


CREATE INDEX "IX_question_survey_id" ON crazyrobot.question (survey_id);


CREATE INDEX "IX_question_option_question_id" ON crazyrobot.question_option (question_id);


CREATE INDEX "IX_survey_created_by_user_id" ON crazyrobot.survey (created_by_user_id);


CREATE INDEX "IX_survey_response_survey_id" ON crazyrobot.survey_response (survey_id);


CREATE INDEX "IX_survey_response_user_id" ON crazyrobot.survey_response (user_id);


