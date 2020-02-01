--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5
-- Dumped by pg_dump version 11.5

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

SET default_with_oids = false;

--
-- Name: dict; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.dict (
    id integer NOT NULL,
    word character varying(200)
);


ALTER TABLE public.dict OWNER TO "derek-lam";

--
-- Name: dict_id_seq; Type: SEQUENCE; Schema: public; Owner: derek-lam
--

CREATE SEQUENCE public.dict_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dict_id_seq OWNER TO "derek-lam";

--
-- Name: dict_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: derek-lam
--

ALTER SEQUENCE public.dict_id_seq OWNED BY public.dict.id;


--
-- Name: dict_ph; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.dict_ph (
    word integer,
    ph integer,
    n integer
);


ALTER TABLE public.dict_ph OWNER TO "derek-lam";

--
-- Name: dict_phs_; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.dict_phs_ (
    w character varying(200),
    ph character varying(4),
    n integer
);


ALTER TABLE public.dict_phs_ OWNER TO "derek-lam";

--
-- Name: ng3; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.ng3 (
    a integer,
    b integer,
    c integer,
    w integer,
    id integer NOT NULL
);


ALTER TABLE public.ng3 OWNER TO "derek-lam";

--
-- Name: ng3_id_seq; Type: SEQUENCE; Schema: public; Owner: derek-lam
--

CREATE SEQUENCE public.ng3_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ng3_id_seq OWNER TO "derek-lam";

--
-- Name: ng3_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: derek-lam
--

ALTER SEQUENCE public.ng3_id_seq OWNED BY public.ng3.id;


--
-- Name: ng_ng_w; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.ng_ng_w (
    a integer,
    b integer,
    w double precision
);


ALTER TABLE public.ng_ng_w OWNER TO "derek-lam";

--
-- Name: ng_w; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.ng_w (
    a integer,
    m double precision,
    v double precision
);


ALTER TABLE public.ng_w OWNER TO "derek-lam";

--
-- Name: ph; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.ph (
    p character(4),
    id integer NOT NULL
);


ALTER TABLE public.ph OWNER TO "derek-lam";

--
-- Name: ph_id_seq; Type: SEQUENCE; Schema: public; Owner: derek-lam
--

CREATE SEQUENCE public.ph_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ph_id_seq OWNER TO "derek-lam";

--
-- Name: ph_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: derek-lam
--

ALTER SEQUENCE public.ph_id_seq OWNED BY public.ph.id;


--
-- Name: ph_w; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.ph_w (
    a integer,
    b integer,
    w double precision
);


ALTER TABLE public.ph_w OWNER TO "derek-lam";

--
-- Name: pl; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.pl (
    id integer NOT NULL,
    name character varying(200),
    nph integer,
    ng integer,
    lon double precision,
    lat double precision
);


ALTER TABLE public.pl OWNER TO "derek-lam";

--
-- Name: pl_; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.pl_ (
    id integer NOT NULL,
    name character varying(200),
    nph integer
);


ALTER TABLE public.pl_ OWNER TO "derek-lam";

--
-- Name: pl_id_seq; Type: SEQUENCE; Schema: public; Owner: derek-lam
--

CREATE SEQUENCE public.pl_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pl_id_seq OWNER TO "derek-lam";

--
-- Name: pl_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: derek-lam
--

ALTER SEQUENCE public.pl_id_seq OWNED BY public.pl.id;


--
-- Name: pl_ng; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.pl_ng (
    pl integer,
    ng integer
);


ALTER TABLE public.pl_ng OWNER TO "derek-lam";

--
-- Name: pl_ph; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.pl_ph (
    pl integer,
    ph integer,
    n integer
);


ALTER TABLE public.pl_ph OWNER TO "derek-lam";

--
-- Name: pl_ph_; Type: TABLE; Schema: public; Owner: derek-lam
--

CREATE TABLE public.pl_ph_ (
    pl integer,
    ph integer,
    n integer
);


ALTER TABLE public.pl_ph_ OWNER TO "derek-lam";

--
-- Name: dict id; Type: DEFAULT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.dict ALTER COLUMN id SET DEFAULT nextval('public.dict_id_seq'::regclass);


--
-- Name: ng3 id; Type: DEFAULT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ng3 ALTER COLUMN id SET DEFAULT nextval('public.ng3_id_seq'::regclass);


--
-- Name: ph id; Type: DEFAULT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ph ALTER COLUMN id SET DEFAULT nextval('public.ph_id_seq'::regclass);


--
-- Name: pl id; Type: DEFAULT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl ALTER COLUMN id SET DEFAULT nextval('public.pl_id_seq'::regclass);


--
-- Name: dict dict_pkey; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.dict
    ADD CONSTRAINT dict_pkey PRIMARY KEY (id);


--
-- Name: dict dict_word_key; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.dict
    ADD CONSTRAINT dict_word_key UNIQUE (word);


--
-- Name: ng3 ng3_pkey; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ng3
    ADD CONSTRAINT ng3_pkey PRIMARY KEY (id);


--
-- Name: ph ph_pkey; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ph
    ADD CONSTRAINT ph_pkey PRIMARY KEY (id);


--
-- Name: pl_ph pl_ph_pl_ph_n_key; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl_ph
    ADD CONSTRAINT pl_ph_pl_ph_n_key UNIQUE (pl, ph, n);


--
-- Name: pl pl_pkey; Type: CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl
    ADD CONSTRAINT pl_pkey PRIMARY KEY (id);


--
-- Name: dict_ph_n_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX dict_ph_n_idx ON public.dict_ph USING btree (n);


--
-- Name: dict_ph_word_ph_n_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE UNIQUE INDEX dict_ph_word_ph_n_idx ON public.dict_ph USING btree (word, ph, n);


--
-- Name: ng3_a_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX ng3_a_idx ON public.ng3 USING btree (a);


--
-- Name: ng3_b_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX ng3_b_idx ON public.ng3 USING btree (b);


--
-- Name: ng3_c_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX ng3_c_idx ON public.ng3 USING btree (c);


--
-- Name: ng_ng_w_a_b_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE UNIQUE INDEX ng_ng_w_a_b_idx ON public.ng_ng_w USING btree (a, b);


--
-- Name: ph_p_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX ph_p_idx ON public.ph USING btree (p);


--
-- Name: pl_name_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE UNIQUE INDEX pl_name_idx ON public.pl USING btree (name);


--
-- Name: pl_ph_n_idx; Type: INDEX; Schema: public; Owner: derek-lam
--

CREATE INDEX pl_ph_n_idx ON public.pl_ph USING btree (n);


--
-- Name: dict_ph dict_ph_ph_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.dict_ph
    ADD CONSTRAINT dict_ph_ph_fkey FOREIGN KEY (ph) REFERENCES public.ph(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dict_ph dict_ph_word_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.dict_ph
    ADD CONSTRAINT dict_ph_word_fkey FOREIGN KEY (word) REFERENCES public.dict(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ng_ng_w ng_ng_w_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ng_ng_w
    ADD CONSTRAINT ng_ng_w_a_fkey FOREIGN KEY (a) REFERENCES public.ng3(id);


--
-- Name: ng_ng_w ng_ng_w_b_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ng_ng_w
    ADD CONSTRAINT ng_ng_w_b_fkey FOREIGN KEY (b) REFERENCES public.ng3(id);


--
-- Name: ph_w ph_w_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ph_w
    ADD CONSTRAINT ph_w_a_fkey FOREIGN KEY (a) REFERENCES public.ph(id);


--
-- Name: ph_w ph_w_b_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.ph_w
    ADD CONSTRAINT ph_w_b_fkey FOREIGN KEY (b) REFERENCES public.ph(id);


--
-- Name: pl pl_ng_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl
    ADD CONSTRAINT pl_ng_fkey FOREIGN KEY (ng) REFERENCES public.ng3(id);


--
-- Name: pl_ng pl_ng_ng_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl_ng
    ADD CONSTRAINT pl_ng_ng_fkey FOREIGN KEY (ng) REFERENCES public.ng3(id);


--
-- Name: pl_ng pl_ng_pl_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl_ng
    ADD CONSTRAINT pl_ng_pl_fkey FOREIGN KEY (pl) REFERENCES public.pl(id);


--
-- Name: pl_ph pl_ph_ph_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl_ph
    ADD CONSTRAINT pl_ph_ph_fkey FOREIGN KEY (ph) REFERENCES public.ph(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pl_ph pl_ph_pl_fkey; Type: FK CONSTRAINT; Schema: public; Owner: derek-lam
--

ALTER TABLE ONLY public.pl_ph
    ADD CONSTRAINT pl_ph_pl_fkey FOREIGN KEY (pl) REFERENCES public.pl(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

