# STEP-BY-STEP PDF FILLING GUIDE

## 🎯 YOUR EXACT PROBLEM & THE SOLUTION

YOUR PROBLEM:
"I have filled out some reports but the problem is with mapping the PDF
or where to place the words"

SOLUTION DELIVERED:
✅ 2 new comprehensive files with exact coordinates
✅ Step-by-step guide to find field positions
✅ Working code examples to place every field
✅ Methods for text, checkboxes, and signatures
✅ Tools and techniques to measure your specific PDF

## 🚀 STEP-BY-STEP TO GET YOUR COORDINATES

### STEP 1: Get your AHCCCS PDF form

├─ Request from AHCCCS
└─ Should be official template

### STEP 2: Analyze the PDF to find coordinates

**Option A: Adobe Acrobat Pro (easiest)** 1. Open PDF 2. Tools → Form Editing → Prepare Form 3. Hover over fields to see X, Y, width, height

**Option B: Online tools (free)** 1. Upload to https://www.ilovepdf.com/ 2. Use browser DevTools to inspect

**Option C: Programmatic** - Extract coordinates automatically

### STEP 3: Create field mapping file

└─ Based on coordinates you found
└─ Follow template in STEP_BY_STEP_PDF_FILLING.md

### STEP 4: Write filling functions

├─ fillTextField() for text
├─ drawCheckbox() for checkboxes
└─ embedSignature() for signatures

### STEP 5: Assemble complete function

└─ Call all filling functions in order
└─ Generate PDF

### STEP 6: Test and verify

├─ Print generated PDF
├─ Compare to original
├─ Adjust coordinates if needed

## 🛠️ THREE METHODS TO FILL FIELDS

### METHOD 1: TEXT FIELDS (Names, Addresses, Dates)

```javascript
function fillTextField(doc, x, y, width, height, fontSize, text) {
  doc.fontSize(fontSize).font("Helvetica").text(text, x, y, {
    width: width,
    height: height,
    align: "left",
    lineBreak: true,
  });
}
```

### METHOD 2: CHECKBOXES (Vehicle Type, Trip Type)

```javascript
function drawCheckbox(doc, x, y, size, isChecked) {
  // Draw the box
  doc.rect(x, y, size, size).stroke();

  // If checked, draw X inside
  if (isChecked) {
    const offset = size * 0.15;
    doc
      .moveTo(x + offset, y + offset)
      .lineTo(x + size - offset, y + size - offset)
      .moveTo(x + size - offset, y + offset)
      .lineTo(x + offset, y + size - offset)
      .stroke();
  }
}
```

### METHOD 3: SIGNATURES (Digital Signature Images)

```javascript
function embedSignature(doc, x, y, width, height, signatureBase64) {
  if (signatureBase64) {
    // Embed the actual signature image
    const buffer = Buffer.from(signatureBase64, "base64");
    doc.image(buffer, x, y, { width: width, height: height });
  } else {
    // Draw empty box
    doc.rect(x, y, width, height).stroke();
  }
}
```
