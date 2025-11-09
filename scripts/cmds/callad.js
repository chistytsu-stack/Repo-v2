const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "2.0",
    author: "GPT-5 Fix (Based on NTKhang)",
    countDown: 5,
    role: 0,
    description: {
      en: "Send report or feedback message to admin bot",
    },
    category: "contacts admin",
    guide: {
      en: "{pn} <message>",
    },
  },

  langs: {
    en: {
      missingMessage: "⚠️ Please enter the message you want to send to the admin.",
      sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
      sendByUser: "\n- Sent from user inbox",
      content: "\n\n📝 Message Content:\n─────────────────\n%1\n─────────────────\nReply this message to respond to the user.",
      success: "✅ Sent your message successfully to %1 admin(s):\n%2",
      failed: "⚠️ Failed to send your message to %1 admin(s):\n%2\n(They may not have messaged the bot yet.)",
      reply: "📩 Reply from admin %1:\n─────────────────\n%2\n─────────────────\nReply this message to continue chatting with admin.",
      replySuccess: "✅ Your reply has been sent to the admin successfully!",
      feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\n─────────────────\n%4\n─────────────────\nReply this message to respond to the user.",
      replyUserSuccess: "✅ Your reply has been sent to the user successfully!",
      noAdmin: "⚠️ No admin found in config.",
    },
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;

    if (!args[0])
      return message.reply(getLang("missingMessage"));

    if (!config.adminBot || config.adminBot.length === 0)
      return message.reply(getLang("noAdmin"));

    const { senderID, threadID, isGroup } = event;
    const senderName = await usersData.getName(senderID);

    const msg =
      "==📨 CALL ADMIN 📨=="
      + `\n- User Name: ${senderName}`
      + `\n- User ID: ${senderID}`
      + (isGroup
        ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID)
        : getLang("sendByUser"));

    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(item => mediaTypes.includes(item.type))
      ),
    };

    const successIDs = [];
    const failedIDs = [];

    for (const uid of config.adminBot) {
      try {
        await api.sendMessage(formMessage, uid);
        successIDs.push(uid);
      } catch (err) {
        failedIDs.push({ id: uid, error: err.message });
        console.error(`[❌ CALLAD] Failed to send to ${uid}: ${err.message}`);
      }
    }

    let resultMsg = "";
    if (successIDs.length > 0) {
      const names = await Promise.all(
        successIDs.map(async id => `${await usersData.getName(id)} (${id})`)
      );
      resultMsg += getLang("success", successIDs.length, names.join("\n"));
    }
    if (failedIDs.length > 0) {
      const names = await Promise.all(
        failedIDs.map(async obj => `${await usersData.getName(obj.id)} (${obj.id})`)
      );
      resultMsg += "\n\n" + getLang("failed", failedIDs.length, names.join("\n"));
    }

    return message.reply(resultMsg || "⚠️ Unknown status. Please check console.");
  },

  onReply: async function ({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    const { type, threadID } = Reply;
    const senderName = await usersData.getName(event.senderID);

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          ),
        };

        try {
          const info = await api.sendMessage(formMessage, threadID);
          message.reply(getLang("replyUserSuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            threadID: event.threadID,
            type: "adminReply",
          });
        } catch (err) {
          console.error("[❌] Failed to send reply to user:", err.message);
          message.reply("⚠️ Unable to send message to user. Possibly permission error.");
        }
        break;
      }

      case "adminReply": {
        const formMessage = {
          body: getLang("feedback", senderName, event.senderID, "", args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
          ),
        };

        try {
          const info = await api.sendMessage(formMessage, threadID);
          message.reply(getLang("replySuccess"));
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            threadID: event.threadID,
            type: "userCallAdmin",
          });
        } catch (err) {
          console.error("[❌] Failed to send feedback to admin:", err.message);
          message.reply("⚠️ Could not send feedback message. Please check bot permissions.");
        }
        break;
      }

      default:
        break;
    }
  },
};
