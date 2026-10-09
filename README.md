# 🏅 Certimaker

Generate certificates in bulk with ease. Upload a certificate background, import a list of names, place the name, date and signature, and download every certificate as images or as one PDF.

🌐 **Live demo:** https://certimaker-ecru.vercel.app/

🔒 Everything runs in your browser. Your template, names and signature are never uploaded to a server.

## ✨ Features

- 🖼️ **Template upload:** use any PNG or JPG as the certificate background. The certificate keeps the image's real size.
- 📋 **Name import:** load names from a `.csv` or `.xlsx` file (first column). A "Name" header row is skipped automatically.
- 🎨 **Name styling:** choose font, size and color, and set the exact X/Y position or center it with one click.
- 📅 **Date:** show or hide it, pick any date (defaults to today), choose from four formats, and set its size and color.
- ✍️ **Signature:** type a signature (drawn in a handwriting style) or upload a signature image. A transparent PNG works best.
- 👆 **Drag to place:** choose Name, Date or Signature above the preview, then drag on the certificate to position it. Works with touch on phones.
- 👀 **Live preview:** switch between loaded names to check how each one fits.
- 📥 **Bulk download:** every certificate as its own PNG, or all of them in one PDF with one page each.

## 🚀 How to use

1. 🌐 Open the [live demo](https://certimaker-ecru.vercel.app/).
2. 🖼️ Upload a certificate template.
3. 📋 Import your names file.
4. 🎨 Style the name, then set up the date and signature.
5. 👆 Drag each item into place on the preview.
6. 📥 Click **Download images** or **Download PDF**.

💡 If the browser asks, allow multiple downloads so all the images can be saved.

## 📄 Names file format

A single column, one name per row. A header is optional.

```
Name
Aayush Batole
Aashutosh Rajput
Abhijeet Meena
Anurag Patidar
```

## 💻 Run it locally

No build step or installation is needed.

1. 📦 Download or clone the project.
2. 🖱️ Open `index.html` in your browser.

📶 An internet connection is needed the first time, because the Excel and PDF libraries load from a CDN.

## 📁 Project structure

```
certimaker/
├── index.html   page layout and controls
├── style.css    styling
└── script.js    drawing, name import, dragging and downloads
```

## 🛠️ Built with

- 🧱 HTML, CSS and JavaScript only
- 📊 [SheetJS](https://sheetjs.com/) to read `.xlsx` files
- 📑 [jsPDF](https://github.com/parallax/jsPDF) to create the PDF
- 🖌️ HTML canvas to draw each certificate

## ☁️ Deployment

The site is deployed on Vercel at https://certimaker-ecru.vercel.app/. Because it is a static site, any static host works the same way: upload `index.html`, `style.css` and `script.js` to the root.

## 💡 Tips

- 🔍 Use a high-resolution template for sharper printing.
- 📏 Keep long names in mind: preview the longest one before downloading.
- ⏳ Large batches take a moment, since each certificate is drawn and saved one by one.
