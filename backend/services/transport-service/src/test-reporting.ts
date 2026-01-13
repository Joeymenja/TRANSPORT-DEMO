
import { tripReportExamples } from './reporting/trip-report-examples';
import { PDFGenerator } from './reporting/trip-report-pdf';
import * as path from 'path';
import * as fs from 'fs';

async function runTests() {
    const outputDir = path.join(__dirname, 'output-test');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Running Reporting System Tests...');

    // Test 1: Simple One-Way
    try {
        console.log('Generating Simple One-Way Trip...');
        const report1 = tripReportExamples.simpleOneWay();
        await PDFGenerator.generatePDF(report1.report, {
            outputPath: path.join(outputDir, 'test_1_simple.pdf'),
            addSignatures: true
        });
        console.log('  - Success: test_1_simple.pdf');
    } catch (e) {
        console.error('  - Failed:', e);
    }

    // Test 2: Carpool Member A
    try {
        console.log('Generating Carpool Member A...');
        const report2 = tripReportExamples.carpoolMemberA();
        await PDFGenerator.generatePDF(report2.report, {
            outputPath: path.join(outputDir, 'test_2_carpool_A.pdf'),
            addSignatures: true
        });
        console.log('  - Success: test_2_carpool_A.pdf');
    } catch (e) {
        console.error('  - Failed:', e);
    }

    // Test 3: Multiple Stops
    try {
        console.log('Generating Multiple Stops Route...');
        const report3 = tripReportExamples.multipleStops();
        await PDFGenerator.generatePDF(report3.report, {
            outputPath: path.join(outputDir, 'test_3_multistop.pdf'),
            addSignatures: true
        });
        console.log('  - Success: test_3_multistop.pdf');
    } catch (e) {
        console.error('  - Failed:', e);
    }

    console.log('\nAll tests completed. Check backend/services/transport-service/src/output-test/ for PDFs.');
}

runTests();
