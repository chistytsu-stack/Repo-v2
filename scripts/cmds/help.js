const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ F A H A D ]"; // decoy text

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "MEHERAZ",
    usePrefix: false,
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // যদি help শুধু লেখা হয় → সব কমান্ড দেখাবে
    if (args.length === 0) {
      const categories = {};
      let msg = "";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─────❃『 ♖${category.toUpperCase()} 』`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 2) {
            const cmds = names.slice(i, i + 2).map((item) => ` ♙${item}`);
            msg += `\n│${cmds.join("   ")}`;
          }
          msg += `\n╰────────────✦`;
        }
      });

      const totalCommands = commands.size;

      msg += `\n\n╭─────❃◔[𝙴𝙽𝙹𝙾𝚈] |[ 𝙼𝙴𝙷𝙴𝚁𝙰𝚉 ]\n│ [ 𝙰𝙳𝙳 𝚃𝙷𝙴 𝙱𝙾𝚃 𝙸𝙳, 𝚂𝙴𝙽𝙳 𝚁𝙴𝚀𝚄𝙴𝚂𝚃 𝙰𝙽𝙳 𝚃𝚈𝙿𝙴: ${prefix}𝙰𝙲𝙿𝙼𝙴 ]\n│ [☞ 𝙳𝙰𝚈𝚁𝙴𝙲𝚃 𝙸𝙳 𝙻𝙸𝙽𝙺: https://www.facebook.com/profile.php?id=61581870474259 ]\n│>𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳𝚂: [☞${totalCommands}].\n│𝚃𝚈𝙿𝙴:[ ⊙${prefix}𝙷𝙴𝙻𝙿 𝚃𝙾⊙\n│⊙<𝙲𝙼𝙳> 𝚃𝙾 𝙻𝙴𝙰𝚁𝙽 𝚃𝙷𝙴 𝚄𝚂𝙰𝙶𝙴.]\n╰────────────✦`;
      msg += `\n╭─────❃\n│ ⍟ | [♛𝙶𝙾𝙰𝚃𝙱𝙾𝚃♛│𝙾𝚆𝙽𝙴𝚁 𝙵𝙱 𝙸𝙳: //www.facebook.com/chisty.57\n╰────────────✦`;

      // ⚡ ইনস্ট্যান্ট রেসপন্স (no image delay)
      await message.reply(msg);
    }

    // help <command> → নির্দিষ্ট কমান্ডের বিস্তারিত দেখাবে
    else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" পাওয়া যায়নি ❌`);
        return;
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const otherNames = configCommand.aliases ? configCommand.aliases.join(", ") : "None";
      const author = configCommand.author || "Unknown";
      const longDescription = configCommand.longDescription?.en || "No description";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

      const response = `╭── ☂𝐍𝐀𝐌𝐄☂ ────⭓
│ ${configCommand.name}
├── ♖𝐈𝐧𝐟𝐨♖
│ ⊚ 𝙾𝚃𝙷𝙴𝚁 𝙽𝙰𝙼𝙴𝚂: ${otherNames}
│ ⇨ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗: ${longDescription}
│ ⇨ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: ${configCommand.version || "1.0"}
│ ⊚ 𝚁𝚘𝚕𝚎: ${roleText}
│ ⇨ 𝚃𝚒𝚖𝚎 𝚙𝚎𝚛 𝚌𝚘𝚖𝚖𝚊𝚗𝚍: ${configCommand.countDown || 1}s
│ ⊚ 𝙰𝚞𝚝𝚑𝚘𝚛: ${author}
├── ⊙𝐔𝐬𝐚𝐠𝐞⊙
│ ${usage}
├── ☂𝐍𝐨𝐭𝐞𝐬☂
│ ☀ <MEHERAZ> অংশ পরিবর্তন করা যাবে
│ ☀ [A|B|C] মানে “অথবা” (A or B or C)
╰━━━━━━━❖`;

      await message.reply(response);
    }
  },
};

// রোল নম্বরকে টেক্সটে কনভার্ট করে
function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (সবার জন্য)";
    case 1:
      return "1 (গ্রুপ অ্যাডমিন)";
    case 2:
      return "2 (বট অ্যাডমিন)";
    default:
      return "Unknown role";
  }
}

// ✅ GoatWrapper ঠিক জায়গায় বসানো হয়েছে
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
