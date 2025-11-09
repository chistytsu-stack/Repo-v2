const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
const filePath = path.join(cacheDir, "autoseen.txt");

module.exports = {
  config: {
    name: "autoseen",
    aliases: ["seen"],
    version: "1.0.0",
    author: "Meheraz",
    shortDescription: {
      en: "Automatically track who sends messages and when they were last seen.",
    },
    category: "📜 System",
    guide: {
      en: "{pn} — automatically saves last seen users into autoseen.txt",
    },
  },

  onStart: async function ({ message, event }) {
    try {
      // Ensure cache folder and file exist
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "", "utf8");
      }

      const userID = event.senderID || "unknown";
      const timestamp = new Date().toISOString();
      const line = `${userID} | ${timestamp}\n`;

      // Append to file
      fs.appendFileSync(filePath, line, "utf8");

      await message.reply(`✅ User ${userID} last seen saved at ${timestamp}`);
    } catch (err) {
      console.error("autoseen error:", err);
      await message.reply("❌ | Error while saving autoseen data.");
    }
  },
};
