-- Fotos públicas de perfil dos treinadores, com gravação restrita ao proprietário.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('fotos-treinadores','fotos-treinadores',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,allowed_mime_types=excluded.allowed_mime_types;
create policy "Treinador envia a propria foto" on storage.objects for insert to authenticated with check (bucket_id='fotos-treinadores' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Treinador atualiza a propria foto" on storage.objects for update to authenticated using (bucket_id='fotos-treinadores' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (bucket_id='fotos-treinadores' and (storage.foldername(name))[1]=auth.uid()::text);
