const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    return message.channel.send('pong')
}

module.exports.config = {
    name: "ping",
    aliases: []
}