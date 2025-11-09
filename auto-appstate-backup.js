// auto-appstate-backup.js
const fs = require("fs");
const path = require("path");

// appstate.json এর path
const appstatePath = path.join(__dirname, "appstate.json");
// backup রাখার ফোল্ডার
const backupDir = path.join(__dirname, "backups");

// যদি backup folder না থাকে, তৈরি করে
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

// 🔹 Backup function
function backupAppstate() {
  if (!fs.existsSync(appstatePath)) {
    console.log("❌ appstate.json ফাইল পাওয়া যায়নি!");
    return;
  }

  const time = new Date();
  const stamp = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}_${time.getHours()}-${time.getMinutes()}`;
  const backupFile = path.join(backupDir, `appstate_${stamp}.json`);

  try {
    fs.copyFileSync(appstatePath, backupFile);
    console.log(`✅ Appstate ব্যাকআপ নেওয়া হয়েছে: ${backupFile}`);
  } catch (err) {
    console.error("⚠️ ব্যাকআপ নিতে গিয়ে সমস্যা হয়েছে:", err);
  }
}

// 🔹 Restore function
function restoreLatestBackup() {
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith("appstate_"));
  if (files.length === 0) {
    console.log("⚠️ কোনো backup ফাইল পাওয়া যায়নি!");
    return;
  }

  // সর্বশেষ ব্যাকআপ বের করা
  files.sort((a, b) => fs.statSync(path.join(backupDir, b)).mtime - fs.statSync(path.join(backupDir, a)).mtime);
  const latest = path.join(backupDir, files[0]);

  try {
    fs.copyFileSync(latest, appstatePath);
    console.log(`♻️ সর্বশেষ backup restore হয়েছে: ${latest}`);
  } catch (err) {
    console.error("⚠️ Restore করতে সমস্যা হয়েছে:", err);
  }
}

// প্রতি ১২ ঘণ্টায় ব্যাকআপ নেবে
setInterval(backupAppstate, 12 * 60 * 60 * 1000);

// বট চালুর সময়ও ব্যাকআপ নেবে
backupAppstate();

// এক্সপোর্ট করে রাখা
module.exports = { backupAppstate, restoreLatestBackup };
