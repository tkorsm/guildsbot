const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Error: Forbidden.")
    let eventEmbed = new Discord.RichEmbed()
    .setAuthor("Event Announcement", 'https://i.imgur.com/iu40r44.png')
    .setThumbnail('https://i.imgur.com/iu40r44.png')
    .setTitle(`5v5 Scrims (RR) | January 1st, 1970`)
    .addField(`Description`, `Join practice matches with your guild in Summoner's Rift 5v5 Tournament Draft. Free agents may register. Stats will not be recorded.`)
    .addField(`Usage`, `Use the [emoji] to enter as a guild member or free agent.`)
    .setFooter("Event Time")
    .addField('Participating Guilds', '```Line 0```')
    .addField('Participating Members', '```Line 1\nLine 2\nLine 3```')
    .addField('Free Agents', '```Line 4```')
    .setTimestamp(Date.UTC(0, 0, 2, 0)) // YEAR, MONTH 0-11, DAY, HOURS (+5)
    return message.channel.send(eventEmbed)
}

module.exports.config = {
    name: "event",
    aliases: []
}