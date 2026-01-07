export const TRIP_REASONS = {
  Medical: [
    'PCP Appointment',
    'Specialist Appointment',
    'Lab Work',
    'Imaging (X-ray / MRI / CT)',
    'Follow-up Visit',
    'Physical Therapy',
    'Dental',
    'Vision'
  ],
  'Behavioral Health': [
    'Psychiatry (Psych) Appointment',
    'Therapy / Counseling',
    'IOP / Group Session',
    'Case Management',
    'MAT / Suboxone Clinic'
  ],
  Pharmacy: [
    'Pick Up Medications',
    'Pharmacy Refill / Drop-off',
    'Medication Delivery Pickup'
  ],
  'Urgent Care / ER': [
    'MyDrNow',
    'Urgent Care',
    'Emergency Room (ER)',
    'Hospital Admission/Discharge'
  ],
  'Court / Legal': [
    'Court Appearance',
    'Probation / Parole',
    'Attorney Meeting',
    'Drug Testing'
  ],
  'Program / Placement': [
    'Intake Appointment',
    'Discharge Transfer',
    'Housing Appointment',
    'Program Transfer'
  ],
  'Benefits / ID': [
    'DES / Benefits Office',
    'Social Security Office',
    'ID / DMV',
    'Food Stamp / EBT Office'
  ],
  Other: [
    'Other'
  ]
};

// Flattened list for simple dropdowns if needed, or use grouped options
export const ALL_TRIP_REASONS = Object.values(TRIP_REASONS).flat();
