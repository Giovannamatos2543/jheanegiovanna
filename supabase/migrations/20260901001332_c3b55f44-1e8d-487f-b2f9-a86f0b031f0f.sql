REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO service_role;