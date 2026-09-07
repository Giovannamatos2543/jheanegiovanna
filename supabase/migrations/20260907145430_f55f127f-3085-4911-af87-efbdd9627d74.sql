-- garantir unicidade dos códigos
DROP INDEX IF EXISTS families_access_code_upper_idx;
CREATE UNIQUE INDEX IF NOT EXISTS families_access_code_key ON public.families (access_code);

-- gerar novos códigos de 4 dígitos únicos para as famílias existentes
DO $$
DECLARE
  f RECORD;
  new_code TEXT;
BEGIN
  FOR f IN SELECT id FROM public.families LOOP
    LOOP
      new_code := lpad((floor(random() * 10000))::int::text, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.families WHERE access_code = new_code);
    END LOOP;
    UPDATE public.families SET access_code = new_code WHERE id = f.id;
  END LOOP;
END $$;

ALTER TABLE public.families
  ADD CONSTRAINT families_access_code_4digits CHECK (access_code ~ '^[0-9]{4}$');
