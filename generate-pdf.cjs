const fs = require('fs');
const path = require('path');

// Read the README content
const readmeContent = fs.readFileSync('README.md', 'utf8');

// Create HTML content with proper styling
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PharmaTrack India - Complete Documentation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #2563eb;
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #1e40af;
            font-size: 1.8em;
            margin-top: 40px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
            padding-left: 15px;
        }
        
        h3 {
            color: #1e3a8a;
            font-size: 1.4em;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        h4 {
            color: #1e293b;
            font-size: 1.2em;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        ul, ol {
            margin-bottom: 20px;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        code {
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #dc2626;
        }
        
        pre {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        th {
            background-color: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        tr:hover {
            background-color: #f1f5f9;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-card {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        
        .feature-card h4 {
            color: #2563eb;
            margin-top: 0;
        }
        
        .architecture-diagram {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
            overflow-x: auto;
        }
        
        .workflow-diagram {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
            overflow-x: auto;
        }
        
        .credentials-table {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .credentials-table h3 {
            color: #059669;
            margin-top: 0;
        }
        
        .tech-stack {
            background-color: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .tech-stack h3 {
            color: #dc2626;
            margin-top: 0;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .toc {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .toc h3 {
            color: #2563eb;
            margin-top: 0;
        }
        
        .toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .toc li {
            margin-bottom: 8px;
            padding-left: 20px;
        }
        
        .toc a {
            color: #374151;
            text-decoration: none;
        }
        
        .toc a:hover {
            color: #2563eb;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #6b7280;
        }
        
        @media print {
            body {
                background-color: white;
            }
            
            .container {
                box-shadow: none;
                padding: 20px;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${readmeContent.replace(/```/g, '<pre>').replace(/```/g, '</pre>')}
        
        <div class="footer">
            <p><strong>PharmaTrack India</strong> - Pharmaceutical Supply Chain Tracking System</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('PharmaTrack_Documentation.html', htmlContent);

console.log('HTML file generated: PharmaTrack_Documentation.html');
console.log('PDF file already generated: PharmaTrack_India_Documentation.pdf');
console.log('');
console.log('Files created:');
console.log('1. PharmaTrack_India_Documentation.pdf - Basic PDF version');
console.log('2. PharmaTrack_Documentation.html - Enhanced HTML version');
console.log('');
console.log('You can open the HTML file in a browser and print to PDF for better formatting.'); 