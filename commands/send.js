const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Error: Forbidden.")
    const recieverChannel = message.mentions.channels.first()
    recieverChannel.send(args.slice(1).join(" "))
}

module.exports.config = {
    name: "send",
    aliases: []
}