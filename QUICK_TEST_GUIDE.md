# Quick Test Guide - Trip Report System

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Ensure both backend and frontend are running
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2
```

---

## 📋 Test Scenario 1: Complete Trip with Report (5 minutes)

### Step 1: Login as Driver
1. Navigate to `http://localhost:5173`
2. Login with driver credentials
3. Navigate to "My Trips" or "Create Trip"

### Step 2: Create & Start Trip
1. Click "Create New Trip"
2. Fill in trip details:
   - **Member**: Select or create a member
   - **Pickup Address**: 1234 Main St, Phoenix, AZ
   - **Dropoff Address**: 5678 Hospital Dr, Phoenix, AZ
   - **Scheduled Time**: Now or near future
3. **Start Trip Immediately** or navigate to trip and click "Start Trip"

### Step 3: Pre-Trip Checklist
1. Check all safety items:
   - ✅ Vehicle inspected
   - ✅ Fuel sufficient
   - ✅ Equipment ready
   - ✅ Driver fit
2. Enter odometer: `45000`
3. Click "Confirm & Start Trip"

### Step 4: Complete Pickup
1. Click "Arrive at Pickup"
2. Confirm member is present
3. Click "Proceed to Dropoff"

### Step 5: Complete Dropoff
1. Click "Arrive at Dropoff"
2. Enter end odometer: `45025` (25 miles traveled)
3. Add optional notes
4. Click "Complete Dropoff"

### Step 6: Fill Trip Report ⭐ (NEW ENHANCED FORM)
1. **Trip Details Section**:
   - Verify pickup time auto-filled
   - Verify dropoff time auto-filled
   - Confirm end odometer: `45025`
   - Trip miles calculated: `25.0 mi`

2. **Trip Type**: Select "One Way"

3. **Reason for Visit**: Select "Primary Care (PCP)"

4. **Escort** (optional): Leave blank or fill if applicable

5. **Service Verification**:
   - ✅ Service was provided as scheduled
   - ✅ Client arrived at destination

6. **Member Signature** 🆕:
   - Click "Review & Sign Document"
   - In the signature modal, draw member signature on canvas
   - Click "Adopt Signature"

7. **Driver Signature** 🆕:
   - In the modal, click "Sign as Driver"
   - Draw your signature on the driver signature pad
   - Click "Adopt Signature"
   - Verify status shows: ✓ Member | ✓ Driver

8. Click "Complete" in modal

9. Click "Submit Trip Report"

### Expected Results:
✅ Success message appears
✅ Trip status changes to "COMPLETED"
✅ Report status shows "PENDING"
✅ PDF file created in `backend/reports/2026/01/07/trip_report_XXXX.pdf`

---

## 📥 Test Scenario 2: View & Download Report (2 minutes)

### Step 1: Navigate to Trip History
1. From driver dashboard, click "Trip History" or navigate to `/driver/trips/history`
2. Locate the trip you just completed

### Step 2: Check Report Status 🆕
- **Report Column** should show: ⏳ **Pending** (orange chip)

### Step 3: Download Report 🆕
1. Click the 📄 (Description) icon in the Actions column
2. PDF should download automatically
3. Open the PDF file

### Expected PDF Contents:
✅ Page 1:
   - Provider: Great Valley Behavioral Homes
   - Driver name visible
   - Vehicle information
   - Member AHCCCS ID, DOB, Name
   - Pickup address & time
   - Dropoff address & time
   - Odometer readings: 45000 → 45025
   - Trip miles: 25
   - Reason: Primary Care

✅ Page 2:
   - Member signature image (drawn signature)
   - Driver signature image (drawn signature)
   - Current date
   - Additional notes (if provided)

---

## 🧪 Test Scenario 3: Proxy Signature (3 minutes)

Repeat Scenario 1, but in Step 6:

### Member Signature with Proxy:
1. ✅ Check "Member is unable to sign"
2. Select proxy signer: "Guardian"
3. No signature canvas appears (this is correct)
4. Complete driver signature as normal
5. Submit report

### Expected Results:
✅ Form accepts submission without member signature
✅ PDF shows proxy information in trip report
✅ Report submitted successfully

---

## 🎯 Test Scenario 4: Signature Validation (1 minute)

### Test Missing Member Signature:
1. Start a new trip report
2. Fill all fields
3. DO NOT sign member signature
4. Try to submit

**Expected**: ❌ Alert: "Please obtain client signature or indicate they are unable to sign"

### Test Missing Driver Signature:
1. Fill all fields
2. Sign member signature
3. DO NOT sign driver signature
4. Try to submit

**Expected**: ❌ Alert: "Driver signature is required to submit the trip report"

---

## 🔍 What to Look For

### ✅ Good Signs:
- [ ] Signature canvases are smooth and responsive
- [ ] Drawn signatures appear in preview
- [ ] Status indicator updates in real-time (✓ Member, ✓ Driver)
- [ ] Submit button enables only when all required fields complete
- [ ] PDF downloads without errors
- [ ] PDF contains both signature images clearly visible
- [ ] Trip history shows correct report status
- [ ] No console errors during signature collection

### ❌ Issues to Report:
- Signature canvas not responding to touch/mouse
- Signatures not appearing in PDF
- PDF missing data fields
- Download button not working
- Console errors during form submission
- Validation not working correctly

---

## 🐛 Troubleshooting

### Issue: Signature canvas not drawing
**Solution**:
- Check browser compatibility (works best in Chrome/Firefox/Safari/Edge)
- Ensure JavaScript is enabled
- Try refreshing the page

### Issue: PDF download fails
**Solution**:
- Check backend is running (`npm run dev` in backend folder)
- Verify API URL in frontend `.env`: `VITE_API_URL=http://localhost:3001/api`
- Check browser console for network errors

### Issue: Signatures missing from PDF
**Solution**:
- Verify you drew and saved signatures before submitting
- Check `backend/services/transport-service/src/pdf.service.ts` has no errors
- Look at backend console for PDF generation logs

### Issue: Trip history not showing reports
**Solution**:
- Refresh the trip history page
- Verify trip was fully completed (status = COMPLETED)
- Check that report was submitted (not just saved as draft)

---

## 📊 Test Results Template

```
Test Date: _______________
Tester: __________________

Scenario 1: Complete Trip with Report
- Pre-trip checklist: [ ] PASS / [ ] FAIL
- Member signature: [ ] PASS / [ ] FAIL
- Driver signature: [ ] PASS / [ ] FAIL
- Report submission: [ ] PASS / [ ] FAIL
- PDF generation: [ ] PASS / [ ] FAIL

Scenario 2: View & Download
- Report status display: [ ] PASS / [ ] FAIL
- PDF download: [ ] PASS / [ ] FAIL
- PDF content accuracy: [ ] PASS / [ ] FAIL

Scenario 3: Proxy Signature
- Proxy workflow: [ ] PASS / [ ] FAIL
- Form acceptance: [ ] PASS / [ ] FAIL

Scenario 4: Validation
- Missing member sig: [ ] PASS / [ ] FAIL
- Missing driver sig: [ ] PASS / [ ] FAIL

Overall Status: [ ] READY FOR PRODUCTION / [ ] NEEDS FIXES

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎉 Success Criteria

Your implementation is working correctly if:

1. ✅ You can draw signatures on both canvases smoothly
2. ✅ Status indicator shows checkmarks for completed signatures
3. ✅ Form validation prevents submission without required signatures
4. ✅ PDF generates successfully with both signature images
5. ✅ Trip history displays report status correctly
6. ✅ PDF downloads open without corruption
7. ✅ All data fields in PDF are populated correctly
8. ✅ Proxy signature workflow works as expected

---

## 📝 Additional Notes

### Performance Tips:
- First PDF generation may take 2-3 seconds (this is normal)
- Signature canvases work best on tablets/touch devices
- Desktop users: use mouse to draw signatures

### Browser Recommendations:
- ✅ Best: Chrome, Firefox, Safari, Edge (latest versions)
- ⚠️ Acceptable: Mobile browsers (iOS Safari, Chrome Mobile)
- ❌ Not Recommended: Internet Explorer

### Mobile Testing:
If testing on mobile device:
1. Ensure device is on same network as development server
2. Replace `localhost` with your computer's IP address
3. Signature pads are optimized for touch input

---

**Happy Testing!** 🚀

For detailed implementation information, see `IMPLEMENTATION_REPORT.md`
