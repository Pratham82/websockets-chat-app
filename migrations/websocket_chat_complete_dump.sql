--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

-- Started on 2025-08-04 19:58:46 UTC

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

DROP DATABASE IF EXISTS websocket_chat;
--
-- TOC entry 3419 (class 1262 OID 16400)
-- Name: websocket_chat; Type: DATABASE; Schema: -; Owner: pratham
--

CREATE DATABASE websocket_chat WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE websocket_chat OWNER TO pratham;

\connect websocket_chat

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
-- TOC entry 222 (class 1259 OID 16431)
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
-- TOC entry 221 (class 1259 OID 16430)
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
-- TOC entry 3420 (class 0 OID 0)
-- Dependencies: 221
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 224 (class 1259 OID 16453)
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
-- TOC entry 223 (class 1259 OID 16452)
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
-- TOC entry 3421 (class 0 OID 0)
-- Dependencies: 223
-- Name: room_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.room_members_id_seq OWNED BY public.room_members.id;


--
-- TOC entry 220 (class 1259 OID 16414)
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
-- TOC entry 219 (class 1259 OID 16413)
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
-- TOC entry 3422 (class 0 OID 0)
-- Dependencies: 219
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- TOC entry 218 (class 1259 OID 16402)
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
-- TOC entry 217 (class 1259 OID 16401)
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
-- TOC entry 3423 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pratham
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3231 (class 2604 OID 16434)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 3235 (class 2604 OID 16456)
-- Name: room_members id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members ALTER COLUMN id SET DEFAULT nextval('public.room_members_id_seq'::regclass);


--
-- TOC entry 3227 (class 2604 OID 16417)
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- TOC entry 3225 (class 2604 OID 16405)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3411 (class 0 OID 16431)
-- Dependencies: 222
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.messages (id, room_id, user_id, content, message_type, created_at, updated_at, deleted_at) FROM stdin;
1	3	1	Hi this is first message	text	2025-08-04 19:35:30.990784	2025-08-04 19:35:30.990784	\N
\.


--
-- TOC entry 3413 (class 0 OID 16453)
-- Dependencies: 224
-- Data for Name: room_members; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.room_members (id, room_id, user_id, role, joined_at) FROM stdin;
5	3	2	admin	2025-08-04 19:33:44.364969
6	3	1	member	2025-08-04 19:34:21.253961
\.


--
-- TOC entry 3409 (class 0 OID 16414)
-- Dependencies: 220
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.rooms (id, name, description, created_by, is_private, created_at, updated_at) FROM stdin;
3	Test	Testing room	2	f	2025-08-04 19:33:44.361239	2025-08-04 19:33:44.361239
\.


--
-- TOC entry 3407 (class 0 OID 16402)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pratham
--

COPY public.users (id, username, email, password, created_at) FROM stdin;
1	prathamesh	prathamesh@gmail.com	$2b$10$AbRnrHzbKbNsJYCchKRjE.10Dvm5rJZ1X3CGKyXtnEg2Wfalbc3K.	2025-08-04 18:11:07.201492
2	joe	joe@gmail.com	$2b$10$QwWhRXMvBzkA9/8w5dwJU.VIjnLguzpno.d03CMQXVn1WPuzjB4YO	2025-08-04 18:52:04.679179
\.


--
-- TOC entry 3424 (class 0 OID 0)
-- Dependencies: 221
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, true);


--
-- TOC entry 3425 (class 0 OID 0)
-- Dependencies: 223
-- Name: room_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.room_members_id_seq', 6, true);


--
-- TOC entry 3426 (class 0 OID 0)
-- Dependencies: 219
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.rooms_id_seq', 3, true);


--
-- TOC entry 3427 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pratham
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 3249 (class 2606 OID 16441)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3253 (class 2606 OID 16460)
-- Name: room_members room_members_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3255 (class 2606 OID 16462)
-- Name: room_members room_members_room_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_room_id_user_id_key UNIQUE (room_id, user_id);


--
-- TOC entry 3245 (class 2606 OID 16424)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 3239 (class 2606 OID 16412)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3241 (class 2606 OID 16408)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3243 (class 2606 OID 16410)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3246 (class 1259 OID 16474)
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- TOC entry 3247 (class 1259 OID 16473)
-- Name: idx_messages_room_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_messages_room_id ON public.messages USING btree (room_id);


--
-- TOC entry 3250 (class 1259 OID 16475)
-- Name: idx_room_members_room_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_room_members_room_id ON public.room_members USING btree (room_id);


--
-- TOC entry 3251 (class 1259 OID 16476)
-- Name: idx_room_members_user_id; Type: INDEX; Schema: public; Owner: pratham
--

CREATE INDEX idx_room_members_user_id ON public.room_members USING btree (user_id);


--
-- TOC entry 3257 (class 2606 OID 16442)
-- Name: messages messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- TOC entry 3258 (class 2606 OID 16447)
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3259 (class 2606 OID 16463)
-- Name: room_members room_members_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- TOC entry 3260 (class 2606 OID 16468)
-- Name: room_members room_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.room_members
    ADD CONSTRAINT room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3256 (class 2606 OID 16425)
-- Name: rooms rooms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratham
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


-- Completed on 2025-08-04 19:58:46 UTC

--
-- PostgreSQL database dump complete
--

