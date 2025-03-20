--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: hometracker_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE hometracker_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE hometracker_db OWNER TO postgres;

\connect hometracker_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: alexandre
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO alexandre;

--
-- Name: houses; Type: TABLE; Schema: public; Owner: alexandre
--

CREATE TABLE public.houses (
    id_house integer NOT NULL,
    name_house character(64) NOT NULL,
    adress character(255),
    city character(64),
    postal_code character(10),
    country character(64),
    description_house character(255)
);


ALTER TABLE public.houses OWNER TO alexandre;

--
-- Name: houses_id_house_seq; Type: SEQUENCE; Schema: public; Owner: alexandre
--

CREATE SEQUENCE public.houses_id_house_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.houses_id_house_seq OWNER TO alexandre;

--
-- Name: houses_id_house_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alexandre
--

ALTER SEQUENCE public.houses_id_house_seq OWNED BY public.houses.id_house;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: alexandre
--

CREATE TABLE public.user_roles (
    id_role integer NOT NULL,
    name_role character(20) NOT NULL
);


ALTER TABLE public.user_roles OWNER TO alexandre;

--
-- Name: user_roles_id_role_seq; Type: SEQUENCE; Schema: public; Owner: alexandre
--

CREATE SEQUENCE public.user_roles_id_role_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_role_seq OWNER TO alexandre;

--
-- Name: user_roles_id_role_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alexandre
--

ALTER SEQUENCE public.user_roles_id_role_seq OWNED BY public.user_roles.id_role;


--
-- Name: users; Type: TABLE; Schema: public; Owner: alexandre
--

CREATE TABLE public.users (
    id_user integer NOT NULL,
    name_user character(20) NOT NULL,
    first_name_user character(20) NOT NULL,
    username_user character(20),
    phone_user character(10),
    pwd_user character(255) NOT NULL,
    date_birthday_user date,
    email_user character(50) NOT NULL,
    date_inscription date,
    description_user character(255),
    id_role integer NOT NULL,
    id_house integer
);


ALTER TABLE public.users OWNER TO alexandre;

--
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: public; Owner: alexandre
--

CREATE SEQUENCE public.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_user_seq OWNER TO alexandre;

--
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: alexandre
--

ALTER SEQUENCE public.users_id_user_seq OWNED BY public.users.id_user;


--
-- Name: houses id_house; Type: DEFAULT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.houses ALTER COLUMN id_house SET DEFAULT nextval('public.houses_id_house_seq'::regclass);


--
-- Name: user_roles id_role; Type: DEFAULT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id_role SET DEFAULT nextval('public.user_roles_id_role_seq'::regclass);


--
-- Name: users id_user; Type: DEFAULT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.users ALTER COLUMN id_user SET DEFAULT nextval('public.users_id_user_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: alexandre
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d0c8e018-00af-4cca-9738-1bdc580810b9	526d3b40b993f3ec6899a669e8c85b525e2f7fb83c194104df6652c6d1e7897c	2025-03-19 08:54:22.09556+00	20250319085422_init	\N	\N	2025-03-19 08:54:22.066286+00	1
\.


--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: alexandre
--

COPY public.houses (id_house, name_house, adress, city, postal_code, country, description_house) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: alexandre
--

COPY public.user_roles (id_role, name_role) FROM stdin;
1	NO_ROLE             
2	ADMIN               
3	MODERATOR           
4	USER                
5	INVITED             
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: alexandre
--

COPY public.users (id_user, name_user, first_name_user, username_user, phone_user, pwd_user, date_birthday_user, email_user, date_inscription, description_user, id_role, id_house) FROM stdin;
2	LB                  	Gus                 	Gus                 	\N	$2b$10$Uyynra6wROjN2nWrEge4n.bg0T1wfp89t01VlirkJSN8PVKkhc3Yu                                                                                                                                                                                                   	\N	gus@mail.com                                      	2025-03-19	J'aime la queue                                                                                                                                                                                                                                                	1	\N
1	Dupont              	Jean                	\N	\N	$2b$10$8TJ2Ntogtc76F5lcl5zc4.kAh7AxbxBlqP2B73mIpYIlJfmqq0m0a                                                                                                                                                                                                   	\N	jean.dupont@exemple.com                           	2025-03-19	\N	1	\N
3	SIVILIER            	Alexandre           	\N	\N	$2b$10$BawWUQoFoQLTH9BprDohCuPIJFQkFuIZVQzWUhIIoBjXHuv84QIKC                                                                                                                                                                                                   	\N	sivilier.alexandre@gmail.com                      	2025-03-19	\N	1	\N
4	Dupont              	Alexandre           	\N	\N	$2a$10$IcnXoylgLlCTyz2YuL2Q3uPg.XHiEg5xgd4NNEJEGuOO.q3BuE7Je                                                                                                                                                                                                   	\N	alexandre@gmail.com                               	2025-03-19	\N	1	\N
5	Michel              	test                	\N	\N	$2a$10$T1BixP53kMSEoLkq5nYX7.fQOgeC78wiymJCB2R8z4tvzJm0AFHAm                                                                                                                                                                                                   	\N	micheltest@gmail.com                              	2025-03-19	\N	1	\N
\.


--
-- Name: houses_id_house_seq; Type: SEQUENCE SET; Schema: public; Owner: alexandre
--

SELECT pg_catalog.setval('public.houses_id_house_seq', 1, false);


--
-- Name: user_roles_id_role_seq; Type: SEQUENCE SET; Schema: public; Owner: alexandre
--

SELECT pg_catalog.setval('public.user_roles_id_role_seq', 5, true);


--
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: alexandre
--

SELECT pg_catalog.setval('public.users_id_user_seq', 5, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: houses houses_pkey; Type: CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.houses
    ADD CONSTRAINT houses_pkey PRIMARY KEY (id_house);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id_role);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- Name: houses_name_house_key; Type: INDEX; Schema: public; Owner: alexandre
--

CREATE UNIQUE INDEX houses_name_house_key ON public.houses USING btree (name_house);


--
-- Name: user_roles_name_role_key; Type: INDEX; Schema: public; Owner: alexandre
--

CREATE UNIQUE INDEX user_roles_name_role_key ON public.user_roles USING btree (name_role);


--
-- Name: users_email_user_key; Type: INDEX; Schema: public; Owner: alexandre
--

CREATE UNIQUE INDEX users_email_user_key ON public.users USING btree (email_user);


--
-- Name: users_phone_user_key; Type: INDEX; Schema: public; Owner: alexandre
--

CREATE UNIQUE INDEX users_phone_user_key ON public.users USING btree (phone_user);


--
-- Name: users users_id_house_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_house_fkey FOREIGN KEY (id_house) REFERENCES public.houses(id_house) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_id_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: alexandre
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_role_fkey FOREIGN KEY (id_role) REFERENCES public.user_roles(id_role) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DATABASE hometracker_db; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON DATABASE hometracker_db TO alexandre;


--
-- PostgreSQL database dump complete
--

