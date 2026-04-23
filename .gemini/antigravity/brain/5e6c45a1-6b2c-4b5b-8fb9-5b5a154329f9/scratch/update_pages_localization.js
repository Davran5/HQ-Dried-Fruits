import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'src/pages/Home.tsx',
    'src/pages/About.tsx',
    'src/pages/Export.tsx',
    'src/pages/Contacts.tsx',
    'src/pages/Privacy.tsx'
];

filesToUpdate.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    if (filePath === 'src/pages/Home.tsx') {
        // Fix uiLabels order
        content = content.replace(/useSEO\(\{([\s\S]*?)\}\);([\s\S]*?)const uiLabels = globalSettings.uiLabels \|\| \{\};/, (match, seoContent, midContent) => {
            return `const { pages, globalSettings } = usePages();\n  const uiLabels = globalSettings.uiLabels || {};\n  useSEO({${seoContent}});\n${midContent}`;
        });
        // Remove duplicate usePages if any
        content = content.replace(/const \{ pages, globalSettings \} = usePages\(\);\s*const uiLabels = globalSettings.uiLabels \|\| \{\};\s*const \{ pages, globalSettings \} = usePages\(\);/, 'const { pages, globalSettings } = usePages();\n  const uiLabels = globalSettings.uiLabels || {};');
    }

    if (filePath === 'src/pages/About.tsx') {
        content = content.replace(/<p className="text-sm font-semibold uppercase tracking-\[0\.24em\] text-earth-500">Global Partners & Facilities<\/p>/, '<p className="text-sm font-semibold uppercase tracking-[0.24em] text-earth-500">{uiLabels.missionNarrativeEyebrow || "Mission Narrative"}</p>');
        content = content.replace(/<h1 className="mt-4 font-display text-\[2\.75rem\] font-bold leading-\[1\.05\] text-earth-900 sm:text-6xl">\s*\{aboutHeroTitle\}\s*<\/h1>/, '<h1 className="mt-4 font-display text-[2.75rem] font-bold leading-[1.05] text-earth-900 sm:text-6xl">{uiLabels.missionNarrativeTitle || aboutHeroTitle}</h1>');
        content = content.replace(/<p className="mt-6 text-lg leading-relaxed text-earth-700 sm:text-xl">\s*\{aboutHeroSubtitle\}\s*<\/p>/, '<p className="mt-6 text-lg leading-relaxed text-earth-700 sm:text-xl">{uiLabels.missionNarrativeSublabel || aboutHeroSubtitle}</p>');
        content = content.replace(/Years Experience<\/p>/g, '{uiLabels.statYearsLabel || "Years Experience"}</p>');
        content = content.replace(/Inside The Facility<\/p>/, '{uiLabels.insideFacilityEyebrow || "Inside The Facility"}</p>');
        content = content.replace(/Precision Sorting & Processing<\/h2>/, '{uiLabels.prodStep2Subtitle || "Precision Sorting & Processing"}</h2>');
    }

    if (filePath === 'src/pages/Export.tsx') {
        content = content.replace(/Export Operations<\/p>/, '{uiLabels.exportOpsEyebrow || "Export Operations"}</p>');
        content = content.replace(/Logistics, Documentation, & Custom Packaging<\/h1>/, '{uiLabels.exportOpsTitle || "Logistics, Documentation, & Custom Packaging"}</h1>');
        content = content.replace(/Custom Packaging<\/h3>/, '{uiLabels.packagingTitle || "Custom Packaging"}</h3>');
        content = content.replace(/Ocean & Rail Freight<\/h3>/, '{uiLabels.transportationTitle || "Ocean & Rail Freight"}</h3>');
        content = content.replace(/Customs Clearance<\/h3>/, '{uiLabels.documentationTitle || "Customs Clearance"}</h3>');
        content = content.replace(/Export Geography<\/p>/, '{uiLabels.destinationBreakdownEyebrow || "Export Geography"}</p>');
        content = content.replace(/Staging Every Line for Dispatch<\/h2>/, '{uiLabels.destinationBreakdownTitle || "Staging Every Line for Dispatch"}</h2>');
        content = content.replace(/Quality Guarantee<\/h3>/, '{uiLabels.qualityGuaranteeTitle || "Quality Guarantee"}</h3>');
        content = content.replace(/Moisture Control<\/h4>/, '{uiLabels.moistureControlLabel || "Moisture Control"}</h4>');
        content = content.replace(/Size Calibration<\/h4>/, '{uiLabels.sizeCalibrationLabel || "Size Calibration"}</h4>');
        content = content.replace(/Microbiological Safety<\/h4>/, '{uiLabels.microSafeLabel || "Microbiological Safety"}</h4>');
    }

    if (filePath === 'src/pages/Contacts.tsx') {
        content = content.replace(/Let's Connect<\/h1>/, '{uiLabels.contactsTitle || "Let\'s Connect"}</h1>');
        content = content.replace(/Send an Inquiry<\/h2>/, '{uiLabels.sendInquiryTitle || "Send an Inquiry"}</h2>');
        content = content.replace(/Send a Message<\/p>/, '{uiLabels.sendMessageLabel || "Send a Message"}</p>');
        content = content.replace(/Contact Information<\/h2>/, '{uiLabels.contactDetailsTitle || "Contact Information"}</h2>');
        content = content.replace(/Email<\/h4>/, '{uiLabels.emailLabel || "Email"}</h4>');
        content = content.replace(/Phone<\/h4>/, '{uiLabels.phoneLabel || "Phone"}</h4>');
        content = content.replace(/Headquarters<\/h4>/, '{uiLabels.headquartersLabel || "Headquarters"}</h4>');
        content = content.replace(/Working Hours<\/h4>/, '{uiLabels.workingHoursLabel || "Working Hours"}</h4>');
    }

    fs.writeFileSync(filePath, content);
});

console.log('Successfully updated all pages with localization labels');
