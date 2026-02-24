/**
 * Expo config plugin: copies the full iOS App Icon set (120x120, 152x152, etc.)
 * from assets/ios-app-icon into the native project and sets CFBundleIconName.
 * No sharp dependency - uses pre-generated icons so EAS Build always has them.
 */
const path = require('path');
const fs = require('fs');
const { withInfoPlist, withFinalizedMod } = require('@expo/config-plugins');

const SOURCE_APPICON_DIR = 'assets/ios-app-icon';

function withIosAppIcon(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleIconName = 'AppIcon';
    return config;
  });

  config = withFinalizedMod(config, [
    'ios',
    async (config) => {
      const { projectRoot, platformProjectRoot, projectName } = config.modRequest;
      const sourceDir = path.join(projectRoot, SOURCE_APPICON_DIR);
      const appIconSetDir = path.join(
        platformProjectRoot,
        projectName || 'DribblingMadness',
        'Images.xcassets',
        'AppIcon.appiconset'
      );

      if (!fs.existsSync(sourceDir)) {
        throw new Error(`withIosAppIcon: source dir not found at ${sourceDir}. Add assets/ios-app-icon/ with Contents.json and all icon PNGs.`);
      }
      if (!fs.existsSync(appIconSetDir)) {
        throw new Error(`withIosAppIcon: AppIcon.appiconset not found at ${appIconSetDir}`);
      }

      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        const src = path.join(sourceDir, file);
        if (!fs.statSync(src).isFile()) continue;
        const dest = path.join(appIconSetDir, file);
        fs.copyFileSync(src, dest);
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withIosAppIcon;
