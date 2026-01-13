
import { PDFGenerator } from './reporting/trip-report-pdf';
import { AHCCCS_FIELD_MAPPING } from './reporting/ahcccs-coordinates';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function generateDebugPDF() {
    console.log("Generating Debug PDF...");
    
    // Load existing manual test result if possible, or generate new
    // Actually, asking PDFGenerator to expose a way to draw debug lines is hard.
    // So I will just duplicate the logic here to draw lines on top of the template.
    
    let templatePath = path.join(process.cwd(), 'src', 'assets', 'OFFICIAL_AHCCCS_FILLABLE.pdf');
    if (!fs.existsSync(templatePath)) {
         // Fallback
         templatePath = '/Users/joel/TRANSPORT-DEMO/backend/services/transport-service/src/assets/OFFICIAL_AHCCCS_FILLABLE.pdf';
    }
    
    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Copy Page 1 to create Page 2 (mimic app logic)
    const [page1Copy] = await pdfDoc.copyPages(pdfDoc, [0]);
    pdfDoc.addPage(page1Copy);
    
    const pages = pdfDoc.getPages();
    const M = AHCCCS_FIELD_MAPPING;
   
    // GLOBAL OFFSET FROM CODE
    const Y_OFFSET = -50;
    const X_OFFSET = -40;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Draw Leg 1 Box
        drawBox(page, M.leg_1.pickup_location, rgb(1, 0, 0), "Leg 1 Pickup (Y=" + M.leg_1.pickup_location.y + ")", X_OFFSET, Y_OFFSET);
        drawBox(page, M.leg_1.dropoff_location, rgb(1, 0, 0), "Leg 1 Dropoff", X_OFFSET, Y_OFFSET);
        
        // Draw Leg 2 Box
        drawBox(page, M.leg_2.pickup_location, rgb(0, 0, 1), "Leg 2 Pickup (Y=" + M.leg_2.pickup_location.y + ")", X_OFFSET, Y_OFFSET);
        
        // Draw Leg 3 Box
        if (M.leg_3 && M.leg_3.pickup_location) {
             drawBox(page, M.leg_3.pickup_location, rgb(0, 1, 0), "Leg 3 Pickup", X_OFFSET, Y_OFFSET);
        }
        
        // Draw Provider Header
        drawBox(page, M.provider_name, rgb(1, 0, 1), "Provider Name (Y=" + M.provider_name.y + ")", X_OFFSET, Y_OFFSET);
    }
    
    const outPath = path.join(process.cwd(), 'debug_test_result.pdf');
    fs.writeFileSync(outPath, await pdfDoc.save());
    console.log(`Saved debug PDF to ${outPath}`);
}

function drawBox(page: any, field: any, color: any, label: string, dx: number, dy: number) {
    if (!field) return;
    const x = field.x + dx;
    const y = field.y + dy;
    const w = field.width || 100;
    const h = field.height || 20;
    
    page.drawRectangle({
        x, y, width: w, height: h,
        borderColor: color, borderWidth: 2,
    });
    
    page.drawText(label, {
        x: x + 5, y: y + 5, size: 8, color: color
    });
}

generateDebugPDF().catch(console.error);
