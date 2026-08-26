-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Families
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  surname text NOT NULL,
  access_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage families" ON public.families FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guests
CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_child boolean NOT NULL DEFAULT false,
  rsvp_status text NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending','confirmed','declined')),
  responded_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guests_family_id_idx ON public.guests(family_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage guests" ON public.guests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Gifts (public list)
CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  value_label text,
  value_cents integer,
  category text NOT NULL,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gifts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active gifts" ON public.gifts FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage gifts" ON public.gifts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Gift claims
CREATE TABLE public.gift_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id uuid NOT NULL REFERENCES public.gifts(id) ON DELETE RESTRICT,
  family_id uuid REFERENCES public.families(id) ON DELETE SET NULL,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_label text,
  method text NOT NULL DEFAULT 'pix' CHECK (method IN ('pix','loja')),
  amount_cents integer,
  status text NOT NULL DEFAULT 'awaiting_confirmation' CHECK (status IN ('awaiting_confirmation','received','cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);
CREATE INDEX gift_claims_gift_id_idx ON public.gift_claims(gift_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_claims TO authenticated;
GRANT ALL ON public.gift_claims TO service_role;
ALTER TABLE public.gift_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage gift claims" ON public.gift_claims FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('rsvp','gift')),
  title text NOT NULL,
  body text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed families + guests (preserving the list already in the site)
INSERT INTO public.families (id, name, surname, access_code) VALUES
  ('11111111-1111-4111-8111-000000000001', 'Família Silva', 'Silva', 'SILVA-4827'),
  ('11111111-1111-4111-8111-000000000002', 'Família Oliveira', 'Oliveira', 'OLIVEIRA-9314'),
  ('11111111-1111-4111-8111-000000000003', 'Família Santos', 'Santos', 'SANTOS-5720'),
  ('11111111-1111-4111-8111-000000000004', 'Família Almeida', 'Almeida', 'ALMEIDA-1638'),
  ('11111111-1111-4111-8111-000000000005', 'Família Ferreira', 'Ferreira', 'FERREIRA-2495'),
  ('11111111-1111-4111-8111-000000000006', 'Família Costa', 'Costa', 'COSTA-7083');

INSERT INTO public.guests (family_id, name, sort_order) VALUES
  ('11111111-1111-4111-8111-000000000001', 'Carlos Silva', 1),
  ('11111111-1111-4111-8111-000000000001', 'Marta Silva', 2),
  ('11111111-1111-4111-8111-000000000001', 'Pedro Silva', 3),
  ('11111111-1111-4111-8111-000000000001', 'Ana Silva', 4),
  ('11111111-1111-4111-8111-000000000002', 'Roberto Oliveira', 1),
  ('11111111-1111-4111-8111-000000000002', 'Helena Oliveira', 2),
  ('11111111-1111-4111-8111-000000000002', 'Lucas Oliveira', 3),
  ('11111111-1111-4111-8111-000000000003', 'José Santos', 1),
  ('11111111-1111-4111-8111-000000000003', 'Maria Santos', 2),
  ('11111111-1111-4111-8111-000000000003', 'Beatriz Santos', 3),
  ('11111111-1111-4111-8111-000000000003', 'Rafael Santos', 4),
  ('11111111-1111-4111-8111-000000000004', 'Eduardo Almeida', 1),
  ('11111111-1111-4111-8111-000000000004', 'Camila Almeida', 2),
  ('11111111-1111-4111-8111-000000000005', 'Marcelo Ferreira', 1),
  ('11111111-1111-4111-8111-000000000005', 'Patrícia Ferreira', 2),
  ('11111111-1111-4111-8111-000000000005', 'Júlia Ferreira', 3),
  ('11111111-1111-4111-8111-000000000006', 'André Costa', 1),
  ('11111111-1111-4111-8111-000000000006', 'Renata Costa', 2),
  ('11111111-1111-4111-8111-000000000006', 'Sofia Costa', 3),
  ('11111111-1111-4111-8111-000000000006', 'Miguel Costa', 4);

-- Seed gifts (same list already on the site, each with its own image)
INSERT INTO public.gifts (name, description, value_label, value_cents, category, image_url, sort_order) VALUES
  ('Jogo de panelas', 'Para os jantares românticos do nosso lar', 'R$ 480', 48000, 'cozinha', 'https://images.unsplash.com/photo-1584990347449-a2d4c2c9a3a6?w=900&q=80&auto=format&fit=crop', 1),
  ('Faqueiro completo', 'Para receber os queridos à mesa', 'R$ 320', 32000, 'cozinha', 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=900&q=80&auto=format&fit=crop', 2),
  ('Cafeteira italiana', 'Para as manhãs lentas a dois', 'R$ 220', 22000, 'cozinha', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop', 3),
  ('Passagens aéreas', 'Um trecho da nossa lua de mel', 'R$ 1.200', 120000, 'lua-de-mel', 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80&auto=format&fit=crop', 4),
  ('Diária romântica', 'Uma noite especial em hotel boutique', 'R$ 850', 85000, 'lua-de-mel', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80&auto=format&fit=crop', 5),
  ('Jantar à beira-mar', 'Um brinde ao nosso amor', 'R$ 400', 40000, 'lua-de-mel', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop', 6),
  ('Jogo de cama king', 'Para as noites mais aconchegantes', 'R$ 380', 38000, 'casa', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&auto=format&fit=crop', 7),
  ('Jogo de toalhas', 'Conforto para o dia a dia', 'R$ 250', 25000, 'casa', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop', 8),
  ('Air fryer', 'Praticidade para o nosso dia a dia', 'R$ 650', 65000, 'eletro', 'https://images.unsplash.com/photo-1574269910231-bc508bcb6dbf?w=900&q=80&auto=format&fit=crop', 9),
  ('Liquidificador premium', 'Para sucos, sopas e mais', 'R$ 480', 48000, 'eletro', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&q=80&auto=format&fit=crop', 10),
  ('Vasos decorativos', 'Para dar vida aos cantinhos da casa', 'R$ 180', 18000, 'deco', 'https://images.unsplash.com/photo-1602874801006-e26c4c5b5a4a?w=900&q=80&auto=format&fit=crop', 11),
  ('Quadros para sala', 'Memórias na parede', 'R$ 300', 30000, 'deco', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80&auto=format&fit=crop', 12),
  ('Ensaio fotográfico', 'Para eternizar nossa lua de mel', 'R$ 700', 70000, 'experiencias', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop', 13),
  ('Passeio de barco', 'Um dia inesquecível a dois', 'R$ 600', 60000, 'experiencias', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop', 14),
  ('Cota Champagne', 'Um brinde simbólico ao nosso amor', 'R$ 80', 8000, 'cotas', 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&q=80&auto=format&fit=crop', 15),
  ('Cota Pétalas', 'Para enfeitar o nosso altar', 'R$ 50', 5000, 'cotas', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80&auto=format&fit=crop', 16),
  ('Cota Velas', 'Luz para o nosso novo lar', 'R$ 30', 3000, 'cotas', 'https://images.unsplash.com/photo-1602607213152-b5ba0b1c8d0e?w=900&q=80&auto=format&fit=crop', 17),
  ('PIX livre', 'Contribua com o valor que desejar', 'Valor livre', NULL, 'pix', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop', 18),
  ('Envelope dourado', 'Presente em dinheiro com elegância', 'R$ 200', 20000, 'pix', 'https://images.unsplash.com/photo-1556742400-b5b7c5121f7a?w=900&q=80&auto=format&fit=crop', 19);
