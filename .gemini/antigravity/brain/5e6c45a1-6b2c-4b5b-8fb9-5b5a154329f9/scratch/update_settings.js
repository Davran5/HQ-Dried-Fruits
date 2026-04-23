import fs from 'fs';
import path from 'path';

const filePath = 'src/pages/admin/GlobalSettings.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldHomeHeader = '<h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">Homepage</h4>';
const newHomeContent = `                                                         <UIField label="Request Catalog" field="requestCatalogLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Explore Products" field="exploreProductsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Heritage Slogan" field="heritageSloganLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="About Company Title" field="aboutCompanyLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Experience Years" field="statYearsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Tons Exported" field="statTonsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Product Selection Sub" field="productSelectionSublabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="View Catalog Btn" field="viewFullCatalogLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Request Sample Link" field="requestSampleLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Learn More Btn" field="learnMoreLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Pricing CTA Btn" field="getPricingLabel" settings={settings} setSettings={setSettings} />`;

// Helper to replace section
function replaceSection(sectionName, newHeader, newFields) {
    const regex = new RegExp('<div className="col-span-full border-b border-slate-200 pb-2 pt-4">\\s*<h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">' + sectionName + '</h4>\\s*</div>([\\s\\S]*?)(?=<div className="col-span-full border-b border-slate-200 pb-2 pt-4">|</div>\\s*</div>\\s*\\)\\s*;?\\s*\\}\\s*\\)\\s*;?\\s*)', 'g');
    content = content.replace(regex, (match) => {
        return `<div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                             <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">${newHeader}</h4>
                                                         </div>
${newFields}`;
    });
}

// Since I already renamed Homepage Specifics to Homepage, I'll update it
replaceSection('Homepage', 'Homepage', newHomeContent);

const aboutFields = `                                                         <UIField label="Mission Narrative Eyebrow" field="missionNarrativeEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Mission Narrative Title" field="missionNarrativeTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Mission Narrative Sub" field="missionNarrativeSublabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Inside Facility Eyebrow" field="insideFacilityEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="HACCP Label" field="haccpLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="ISO Label" field="isoLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Organic Label" field="organicLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="GlobalGap Label" field="globalGapLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="FDA Label" field="fdaLabel" settings={settings} setSettings={setSettings} />`;

replaceSection('Common Form Labels', 'About Page', aboutFields);

const exportFields = `                                                         <UIField label="Ops Eyebrow" field="exportOpsEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Ops Title" field="exportOpsTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Packaging Title" field="packagingTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Transport Title" field="transportationTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Clearance Title" field="documentationTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Dest. Eyebrow" field="destinationBreakdownEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Dest. Title" field="destinationBreakdownTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Quality Title" field="qualityGuaranteeTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Moisture Label" field="moistureControlLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Calibration Label" field="sizeCalibrationLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Micro Safe Label" field="microSafeLabel" settings={settings} setSettings={setSettings} />`;

replaceSection('Products Page UI', 'Export Page', exportFields);

const contactsFields = `                                                         <UIField label="Form Name Label" field="formNameLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Form Email Label" field="formEmailLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Form Phone Label" field="formPhoneLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Form Message Label" field="formMessageLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Submit Button Label" field="submitBtnLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Submitting Label" field="submittingLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Hero Title" field="contactsTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Inquiry Form Title" field="sendInquiryTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Message Label" field="sendMessageLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Contact Details Title" field="contactDetailsTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Inquiry Success Msg" field="inquirySuccessMsg" settings={settings} setSettings={setSettings} />`;

// Footer Labels was still there in the view
replaceSection('Footer Labels', 'Contacts & Forms', contactsFields);

// Append Footer section if not present
if (!content.includes('tracking-wider">Footer</h4>')) {
    const footerContent = `
                                                         <div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                             <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">Footer</h4>
                                                         </div>
                                                         <UIField label="Links Section Title" field="footerLinksTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Copyright Text" field="footerCopyright" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Privacy Link Label" field="footerPrivacyLinkLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Terms Link Label" field="footerTermsLinkLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Footer Inquiry Success" field="footerInquirySuccess" settings={settings} setSettings={setSettings} />`;
    
    content = content.replace(/(<\/div>\s*<\/div>\s*\)\s*;?\s*\}\s*\)\s*;?\s*)/, (match) => {
        return footerContent + "\n" + match;
    });
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated GlobalSettings.tsx');
