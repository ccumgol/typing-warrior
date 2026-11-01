// electron-builder afterPack: put the app icon and version info into the Windows .exe when building on macOS.
// electron-builder normally does this with rcedit, which needs wine (Intel only) on a Mac, so mac builds use
// `-c.win.signAndEditExecutable=false` and this hook does the same edit with resedit (a dependency of electron-builder).
// On Windows the normal rcedit step runs instead and this hook does nothing.
const fs = require('node:fs');
const path = require('node:path');

const ICON_GROUP_ID = 1; // Electron's exe keeps its icon in group 1, language 1033
const LANG = 1033;
const CODEPAGE = 1200;

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32' || process.platform === 'win32') return;
  const ResEdit = require('resedit');
  const { appInfo } = context.packager;
  const exePath = path.join(context.appOutDir, `${appInfo.productFilename}.exe`);
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath));
  const resources = ResEdit.NtExecutableResource.from(exe);

  const icon = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, 'icon.ico')));
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(resources.entries, ICON_GROUP_ID, LANG, icon.icons.map((item) => item.data));

  const [version] = ResEdit.Resource.VersionInfo.fromEntries(resources.entries);
  if (version) {
    const [major, minor, patch] = appInfo.version.split('.').map(Number);
    version.setFileVersion(major, minor, patch, 0, LANG);
    version.setProductVersion(major, minor, patch, 0, LANG);
    version.setStringValues({ lang: LANG, codepage: CODEPAGE }, {
      ProductName: appInfo.productName,
      FileDescription: appInfo.productName,
      CompanyName: appInfo.companyName || 'Gihyun Park',
      LegalCopyright: appInfo.copyright,
      InternalName: appInfo.productFilename,
      OriginalFilename: `${appInfo.productFilename}.exe`,
      FileVersion: appInfo.version,
      ProductVersion: appInfo.version,
    });
    version.outputToResourceEntries(resources.entries);
  }

  resources.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.info(`  • set icon and version info  file=${path.basename(exePath)}`);
};
