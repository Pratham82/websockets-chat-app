--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: pratham
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    room_id integer,
    user_id integer,
    content text NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone
);


ALTER TABLE public.messages OWNER TO pratham;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: pratham
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO pratham;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: room_members; Type: TABLE; Schema: public; Owner: pratham
--

CREATE TABLE public.room_members (
    id integer NOT NULL,
    room_id integer,
    user_id integer,
    role character varying(20) DEFAULT 'member'::character varying,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.room_members OWNER TO pratham;

--
-- Name: room_members_id_seq; Type: SEQUENCE; Schema: public; Owner: pratham
--

CREATE SEQUENCE public.room_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_members_id_seq OWNER TO pratham;

--
-- Name: room_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.room_members_id_seq OWNED BY public.room_members.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: pratham
--

CREATE TABLE public.rooms (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_by integer,
    is_private boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rooms OWNER TO pratham;

--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: pratham
--

CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_id_seq OWNER TO pratham;

--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: pratham
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO pratham;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: pratham
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO pratham;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: room_members id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members ALTER COLUMN id SET DEFAULT nextval('public.room_members_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.messages (id, room_id, user_id, content, message_type, created_at, updated_at, deleted_at) FROM stdin;
1	3	1	Hi this is first message	text	2025-08-04 19:35:30.990784	2025-08-04 19:35:30.990784	\N
\.


--
-- Data for Name: room_members; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.room_members (id, room_id, user_id, role, joined_at) FROM stdin;
5	3	2	admin	2025-08-04 19:33:44.364969
6	3	1	member	2025-08-04 19:34:21.253961
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.rooms (id, name, description, created_by, is_private, created_at, updated_at) FROM stdin;
3	Test	Testing room	2	f	2025-08-04 19:33:44.361239	2025-08-04 19:33:44.361239
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
1	prathamesh	prathamesh@gmail.com	$2b$10$AbRnrHzbKbNsJYCchKRjE.10Dvm5rJZ1X3CGKyXtnEg2Wfalbc3K.	2025-08-04 18:11:07.201492
2	joe	joe@gmail.com	$2b$10$QwWhRXMvBzkA9/8w5dwJU.VIjnLguzpno.d03CMQXVn1WPuzjB4YO	2025-08-04 18:52:04.679179
\.


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, true);


--
-- Name: room_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.room_members_id_seq', 6, true);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.rooms_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: room_members room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_pkey PRIMARY KEY (id);


--
-- Name: room_members room_members_room_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_room_id_user_id_key UNIQUE (room_id, user_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_messages_room_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_messages_room_id ON public.messages USING btree (room_id);


--
-- Name: idx_room_members_room_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_room_members_room_id ON public.room_members USING btree (room_id);


--
-- Name: idx_room_members_user_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_room_members_user_id ON public.room_members USING btree (user_id);


--
-- Name: messages messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: room_members room_members_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_members room_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rooms rooms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

