const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'locales/en.json');
const viPath = path.join(__dirname, 'locales/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const viKeys = getKeys(vi);

const missingInVi = enKeys.filter(k => !viKeys.includes(k));
const missingInEn = viKeys.filter(k => !enKeys.includes(k));

if (missingInVi.length > 0) {
  console.error('Keys in en.json but missing in vi.json:', missingInVi);
}
if (missingInEn.length > 0) {
  console.error('Keys in vi.json but missing in en.json:', missingInEn);
}

if (missingInVi.length === 0 && missingInEn.length === 0) {
  console.log('Success: All translation keys are perfectly synchronized!');
} else {
  process.exit(1);
}
