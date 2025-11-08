module.exports = {
  config: {
    name: "antiout",
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "Enable or disable antiout",
    longDescription: "",
    category: "boxchat",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5
    }
  },
  onStart: async function({ message, event, threadsData, args }) {
    let antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (antiout === undefined) {
      await threadsData.set(event.threadID, true, "settings.antiout");
      antiout = true;
    }
    if (!["𝙾𝙽", "𝙾𝙵𝙵"].includes(args[0])) {
      return message.reply("✦━━━━━━━━━━━━━━━━✦\nn 𝙿𝙻𝙴𝙰𝚂𝙴 𝚄𝚂𝙴 '𝙾𝙽' 𝙾𝚁 '𝙾𝙵𝙵' 𝙰𝚂 𝙰𝙽 𝙰𝚁𝙶𝚄𝙼𝙴𝙽𝚃\n\n ✦━━━━━━━━━━━━━━━━✦");
    }
    await threadsData.set(event.threadID, args[0] === "on", "settings.antiout");
    return message.reply(`✦━━━━━━━━━━━━━━━━✦\n\n 𝙰𝙽𝚃𝙸𝙾𝚄𝚃 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽 ${args[0] === "𝙾𝙽" ? "enabled" : "disabled"}.\n\n ✦━━━━━━━━━━━━━━━━✦`);
  },
  onEvent: async function({ api, event, threadsData }) {
    const antiout = await threadsData.get(event.threadID, "settings.antiout");
    if (antiout && event.logMessageData && event.logMessageData.leftParticipantFbId) {
      // A user has left the chat, get their user ID
      const userId = event.logMessageData.leftParticipantFbId;

      // Check if the user is still in the chat
      const threadInfo = await api.getThreadInfo(event.threadID);
      const userIndex = threadInfo.participantIDs.indexOf(userId);
      if (userIndex === -1) {
        // The user is not in the chat, add them back
        const addUser = await api.addUserToGroup(userId, event.threadID);
        if (addUser) {
          console.log(`User ${userId} was added back to the group chat you can't escape 🧟.`);
        } else {
          console.log(`Failed to add user ${userId} back to the group chat.`);
        }
      }
    }
  }
};
