const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Error: Forbidden.")
    let rolesMessage = await message.channel.send(`Self-assign your roles by using the reactions below.\n\n<:Top:668845098636673034> Top\n<:Jungle:668845111764844554> Jungle\n<:Mid:668845214533943301> Mid\n<:ADC:668845232401416233> ADC\n<:Support:668845250474803221> Support\n ឵឵`)
    await rolesMessage.react('668845098636673034')
    await rolesMessage.react('668845111764844554')
    await rolesMessage.react('668845214533943301')
    await rolesMessage.react('668845232401416233')
    await rolesMessage.react('668845250474803221')
}

module.exports.config = {
    name: "roles",
    aliases: []
}