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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pratham
--

INSERT INTO public.users VALUES (1, 'prathamesh', 'prathamesh@gmail.com', '$2b$10$AbRnrHzbKbNsJYCchKRjE.10Dvm5rJZ1X3CGKyXtnEg2Wfalbc3K.', '2025-08-04 18:11:07.201492');
INSERT INTO public.users VALUES (2, 'joe', 'joe@gmail.com', '$2b$10$QwWhRXMvBzkA9/8w5dwJU.VIjnLguzpno.d03CMQXVn1WPuzjB4YO', '2025-08-04 18:52:04.679179');


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: pratham
--

INSERT INTO public.rooms VALUES (3, 'Test', 'Testing room', 2, false, '2025-08-04 19:33:44.361239', '2025-08-04 19:33:44.361239');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: pratham
--

INSERT INTO public.messages VALUES (1, 3, 1, 'Hi this is first message', 'text', '2025-08-04 19:35:30.990784', '2025-08-04 19:35:30.990784', NULL);


--
-- Data for Name: room_members; Type: TABLE DATA; Schema: public; Owner: pratham
--

INSERT INTO public.room_members VALUES (5, 3, 2, 'admin', '2025-08-04 19:33:44.364969');
INSERT INTO public.room_members VALUES (6, 3, 1, 'member', '2025-08-04 19:34:21.253961');


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
-- PostgreSQL database dump complete
--

