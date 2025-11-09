/*
───────────────────────────────
💾 addfile-pro.js | Create any file type from Messenger
🧠 Author: ChatGPT (for AceGun)
📦 Requires: fs-extra
───────────────────────────────
*/

const fs = require("fs-extra");

module.exports = {
  config: {
    name: "addfile-pro",
    aliases: ["savefile", "createfile"],
    version: "2.0",
    author: "Meheraz",
    role: 2, // only bot admin can use
    shortdescription: "Create and save any file type from Messenger",
    longdescription: "Allows bot admins to create .js, .txt, .json, .html, and more directly from chat",
    category: "system",
    usages: "{pn} <filename.ext> (reply or inline content)",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // ✅ Only allow admins (replace with your own ID if needed)
    const adminIDs = ["100023789902793"]; // <-- তোমার FB UID এখানে বসাও
    if (!adminIDs.includes(senderID)) {
      return api.sendMessage("⚠️ | You don't have permission to use this command.", threadID, event.messageID);
    }

    // 🧩 Get file name from arguments
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage(
        "📝 | Please provide a full filename with extension.\nExample: addfile-pro notes.txt",
        threadID,
        event.messageID
      );
    }

    // 🧾 Get content from reply or inline message
    let fileContent = "";
    if (event.type === "message_reply" && event.messageReply?.body) {
      fileContent = event.messageReply.body;
    } else {
      fileContent = args.slice(1).join(" ");
    }

    if (!fileContent) {
      return api.sendMessage(
        "📩 | Please reply with the file content or include it inline.",
        threadID,
        event.messageID
      );
    }

    // 🗂 Save file to scripts/cmds/ by default (you can change path)
    const folderPath = `${__dirname}/`;
    const filePath = `${folderPath}${fileName}`;

    try {
      // ✍️ Write file content
      await fs.writeFile(filePath, fileContent, "utf8");

      api.sendMessage(
        `✅ | File created successfully!\n📁 Path: cmds/${fileName}\n\n📄 Type: ${fileName.split('.').pop()}`,
        threadID,
        event.messageID
      );
    } catch (error) {
      console.error("❌ Error saving file:", error);
      api.sendMessage("❌ | Failed to save file. Check console for details.", threadID, event.messageID);
    }
  }
};
