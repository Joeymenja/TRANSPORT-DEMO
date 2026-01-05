INSERT INTO vehicle_documents (
  id, organization_id, vehicle_id, document_type, 
  file_name, file_path, file_size, mime_type, 
  uploaded_at, expires_at
) VALUES (
  gen_random_uuid(), 
  (SELECT organization_id FROM vehicles WHERE id = '5a279e91-f5e3-4011-87ff-2b6a74303076'),
  '5a279e91-f5e3-4011-87ff-2b6a74303076',
  'INSURANCE',
  'dummy_insurance.pdf',
  '/tmp/dummy_insurance.pdf',
  1024,
  'application/pdf',
  NOW(),
  NOW() + INTERVAL '1 year'
);
