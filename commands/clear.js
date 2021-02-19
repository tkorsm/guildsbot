const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Error: Forbidden.")
    if (!args[0]) return message.channel.send("Usage: !clear [amount]")
    return message.channel.bulkDelete(args[0])
}

module.exports.config = {
    name: "clear",
    aliases: []
}