ALTER TABLE public.tickets DROP CONSTRAINT tickets_created_by_fkey;
ALTER TABLE public.tickets DROP CONSTRAINT tickets_assigned_to_fkey;
ALTER TABLE public.comments DROP CONSTRAINT comments_author_id_fkey;

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;