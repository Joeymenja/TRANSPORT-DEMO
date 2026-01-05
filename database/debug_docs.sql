SELECT v.id as vehicle_id, v.make, v.model, d.id as doc_id, d.document_type, d.expires_at 
FROM vehicles v 
LEFT JOIN vehicle_documents d ON v.id = d.vehicle_id;
