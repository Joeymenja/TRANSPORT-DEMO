/**
 * EXACT FIELD MAPPING FOR AHCCCS DAILY TRIP REPORT FORM
 * Coordinates in PDF points (Bottom-Left Origin)
 */

export const AHCCCS_FIELD_MAPPING = {
  // ─────────────────────────────────────────────────────────────
  // SECTION 1: PROVIDER INFORMATION (Top of form)
  // ─────────────────────────────────────────────────────────────
  
  provider_ahcccs_id: { x: 42, y: 745, width: 80, height: 15, fontSize: 10 },
  provider_name: { x: 220, y: 745, width: 350, height: 15, fontSize: 10 },
  provider_address: { x: 220, y: 728, width: 150, height: 30, fontSize: 9, multiline: true },
  provider_phone: { x: 220, y: 698, width: 80, height: 15, fontSize: 9 },

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: DRIVER & VEHICLE INFORMATION (Right side)
  // ─────────────────────────────────────────────────────────────

  vehicle_fleet_id: { x: 540, y: 745, width: 65, height: 12, fontSize: 9 },
  vehicle_make_color: { x: 540, y: 730, width: 65, height: 12, fontSize: 9 },

  vehicle_type: {
    wheelchair_van: { x: 540, y: 715, size: 10, type: "checkbox" },
    taxi: { x: 600, y: 715, size: 10, type: "checkbox" },
    bus: { x: 650, y: 715, size: 10, type: "checkbox" },
    other: { x: 695, y: 715, size: 10, type: "checkbox" }
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: MEMBER INFORMATION (Center/Left)
  // ─────────────────────────────────────────────────────────────

  member_ahcccs_id: { x: 42, y: 675, width: 100, height: 12, fontSize: 9 },
  member_dob: { x: 300, y: 675, width: 100, height: 12, fontSize: 9 },
  member_name: { x: 42, y: 662, width: 100, height: 12, fontSize: 9 },
  member_address: { x: 300, y: 662, width: 120, height: 25, fontSize: 9, multiline: true },

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: TRIP LEG 1
  // ─────────────────────────────────────────────────────────────
  // Note: Leg 1 Trip Type Order: One Way, Multiple Stops, Round Trip
  
  leg_1: {
      pickup_location: { x: 42, y: 700, width: 450, height: 30, fontSize: 9, multiline: true },
      pickup_time: { x: 520, y: 660, width: 50, height: 12, fontSize: 9 },
      pickup_odometer: { x: 615, y: 660, width: 45, height: 12, fontSize: 9 },
      
      dropoff_location: { x: 42, y: 660, width: 450, height: 30, fontSize: 9, multiline: true },
      dropoff_time: { x: 520, y: 575, width: 50, height: 12, fontSize: 9 },
      dropoff_odometer: { x: 615, y: 575, width: 45, height: 12, fontSize: 9 },
      trip_miles: { x: 680, y: 575, width: 35, height: 12, fontSize: 9 },

      trip_type: {
          one_way: { x: 42, y: 553, size: 10, type: "checkbox" },
          multiple_stops: { x: 200, y: 553, size: 10, type: "checkbox" },
          round_trip: { x: 420, y: 553, size: 10, type: "checkbox" }
      },

      reason: { x: 42, y: 535, width: 450, height: 12, fontSize: 9 },
      escort_name: { x: 42, y: 520, width: 200, height: 12, fontSize: 9 },
      escort_relationship: { x: 300, y: 520, width: 200, height: 12, fontSize: 9 }
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: TRIP LEG 2
  // ─────────────────────────────────────────────────────────────
  // Note: Leg 2 Trip Type Order: Round Trip, One Way, Multiple Stops
  
  leg_2: {
      pickup_location: { x: 42, y: 560, width: 450, height: 30, fontSize: 9, multiline: true },
      pickup_time: { x: 520, y: 530, width: 50, height: 12, fontSize: 9 },
      pickup_odometer: { x: 615, y: 530, width: 45, height: 12, fontSize: 9 },

      dropoff_location: { x: 42, y: 545, width: 450, height: 30, fontSize: 9, multiline: true },
      dropoff_time: { x: 520, y: 430, width: 50, height: 12, fontSize: 9 },
      dropoff_odometer: { x: 615, y: 430, width: 45, height: 12, fontSize: 9 },
      trip_miles: { x: 680, y: 430, width: 35, height: 12, fontSize: 9 },

      trip_type: {
          round_trip: { x: 42, y: 375, size: 10, type: "checkbox" },
          one_way: { x: 200, y: 375, size: 10, type: "checkbox" },
          multiple_stops: { x: 350, y: 375, size: 10, type: "checkbox" }
      },

      reason: { x: 42, y: 395, width: 450, height: 12, fontSize: 9 },
      escort_name: { x: 42, y: 355, width: 200, height: 12, fontSize: 9 },
      escort_relationship: { x: 300, y: 355, width: 200, height: 12, fontSize: 9 }
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: TRIP LEG 3
  // ─────────────────────────────────────────────────────────────
  
  leg_3: {
      pickup_location: { x: 42, y: 435, width: 450, height: 30, fontSize: 9, multiline: true },
      pickup_time: { x: 520, y: 385, width: 50, height: 12, fontSize: 9 },
      pickup_odometer: { x: 615, y: 385, width: 45, height: 12, fontSize: 9 },

      dropoff_location: { x: 42, y: 420, width: 450, height: 30, fontSize: 9, multiline: true },
      dropoff_time: { x: 520, y: 290, width: 50, height: 12, fontSize: 9 },
      dropoff_odometer: { x: 615, y: 290, width: 45, height: 12, fontSize: 9 },
      trip_miles: { x: 680, y: 290, width: 35, height: 12, fontSize: 9 }
      // Leg 3 usually doesn't have checkboxes separate from leg 2? 
      // User mapping didn't show Leg 3 checkboxes?
      // "Check AHCCCS rules". 
      // The user provided mapping ended at Leg 3 coords.
      // We'll leave Leg 3 checkboxes/details out unless user specifies.
  },

  // ─────────────────────────────────────────────────────────────
  // SECTION 7: SIGNATURES
  // ─────────────────────────────────────────────────────────────

  member_signature: { x: 42, y: 200, width: 200, height: 50, type: "signature" },
  member_signature_date: { x: 42, y: 180, width: 100, height: 12, fontSize: 9 },

  driver_signature: { x: 350, y: 200, width: 200, height: 50, type: "signature" },
  driver_signature_date: { x: 350, y: 180, width: 100, height: 12, fontSize: 9 }
};
