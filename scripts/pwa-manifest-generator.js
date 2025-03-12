const fs = require("fs");
const path = require("path");
const ROOT_DIR = path.resolve(__dirname, '..'); // Assuming this script is in a 'scripts' dir
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

function getFiles(dir, basePath = "/") {
  let fileList = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileUrl = path.join(basePath, file).replace(/\\/g, "/");

    if (fs.statSync(filePath).isDirectory()) {
      fileList = fileList.concat(getFiles(filePath, fileUrl));
    } else {
      fileList.push(fileUrl);
    }
  });

  return fileList;
}

function generateAssetManifest() {
  const assets = getFiles(PUBLIC_DIR);
  fs.writeFileSync(path.join(PUBLIC_DIR, "asset-manifest.json"), JSON.stringify(assets, null, 2));
  console.log("Asset manifest generated!", assets);
}

function copyRootAssets() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log("Assets directory does not exist.");
    return;
  }

  const logoFiles = fs.readdirSync(ASSETS_DIR).filter(file => {
      return file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.svg'); // Filter for image files
  });

  if (logoFiles.length === 0) {
      console.log("No logo files found in assets directory.");
      return;
  }

  logoFiles.forEach(logoFile => {
      const sourcePath = path.join(ASSETS_DIR, logoFile);
      const destinationPath = path.join(PUBLIC_DIR, logoFile);

      fs.copyFileSync(sourcePath, destinationPath);
      console.log(`Copied ${logoFile} to public directory.`);
  });
}

function generatePWAManifest(siteTitle, instanceName) {
  copyRootAssets();
  generateAssetManifest(); // fetched later in service-worker

  const fullName = instanceName ? `${siteTitle} - ${instanceName}` : siteTitle;
  const pwaManifest = {
      name: fullName,
      short_name: fullName,
      description: "A stupid simple budget app",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "logo.png",
          type: "image/png",
          sizes: "192x192"
        },
        {
          src: "logo.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
      orientation: "any"
  };

  fs.writeFileSync(path.join(PUBLIC_DIR, "manifest.json"), JSON.stringify(pwaManifest, null, 2));
  console.log("PWA manifest generated!", pwaManifest);
}

module.exports = { generatePWAManifest };