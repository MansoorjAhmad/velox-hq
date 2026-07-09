create policy "owner_storage_select" on storage.objects for select
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner_storage_insert" on storage.objects for insert
  with check (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner_storage_update" on storage.objects for update
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "owner_storage_delete" on storage.objects for delete
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);