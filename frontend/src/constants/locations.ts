export const COMMON_LOCATIONS = [
  // Group Homes / Recurring Pickups
  { name: 'Latona House', address: '6338 W Latona Road, Laveen, AZ 85339', category: 'HOME' },
  { name: 'Carter House', address: '3255 W Carter Road, Phoenix, AZ 85041', category: 'HOME' },
  { name: 'Carmen House', address: '1550 W Carmen Street, Phoenix, AZ 85041', category: 'HOME' },
  { name: 'Walatowa House', address: '5420 W Walatowa Street, Laveen, AZ 85339', category: 'HOME' },
  { name: 'Clover', address: '5610 W Hardtack Trl, Laveen, AZ 85339', category: 'HOME' },
  { name: 'StarLight', address: '3921 S 97th Ave, Tolleson, AZ 85353', category: 'HOME' },
  { name: 'Paseo', address: '5533 W Paseo Way, Laveen, AZ 85339', category: 'HOME' },

  // Recurring Destinations / Clinics
  { name: 'GVBH Office', address: '5723 W. Pueblo Ave, Phoenix, AZ 85043', category: 'OFFICE' },
  { name: 'Common Medical Center', address: '2500 Medical Center Drive, Phoenix, AZ 85012', category: 'CLINIC' },
  { name: 'Phoenix General Hospital', address: '3000 Phoenix General Hospital Road, Phoenix, AZ 85006', category: 'HOSPITAL' },
  { name: 'Pharmacy Plaza', address: '4000 Pharmacy Plaza, Phoenix, AZ 85014', category: 'PHARMACY' },
  { name: 'Cardiac Specialists', address: '5000 Cardiac Specialists, Phoenix, AZ 85018', category: 'CLINIC' },
  { name: 'MyDrNow - Laveen', address: '5533 W Baseline Rd, Laveen, AZ 85339', category: 'URGENT_CARE' },
  { name: 'Banner University Med', address: '1111 E McDowell Rd, Phoenix, AZ 85006', category: 'HOSPITAL' },
];

export const ALL_ADDRESSES = COMMON_LOCATIONS.map(loc => loc.address);
