const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    var coinsData = JSON.parse(fs.readFileSync('./config/coinsData.json', 'utf8'));
    let mentionedMember = message.mentions.members.first() || false
    if(!coinsData[message.author.id]) coinsData[message.author.id] = {
        coins: 0
    }
    if(!coinsData[mentionedMember.id]) coinsData[mentionedMember.id] = {
        coins: 0
    }
    if (mentionedMember) {
        if (mentionedMember.user != message.author) return message.channel.send(`${mentionedMember.user.tag} has ${coinsData[mentionedMember.id].coins} coins.`)
    }
    message.channel.send(`You have ${coinsData[message.author.id].coins} coins.`)
}

module.exports.config = {
    name: "coins",
    aliases: []
}