const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");

module.exports.run = async (bot, message, args) => {
    const selfAssignChannel = message.guild.channels.get('668846511404089349')
    const selfAssignMessage = await selfAssignChannel.messages.fetch('669057955714301955')
    selfAssignMessage.edit(`Self-assign your roles by using the reactions below.\n\n<:Top:668845098636673034> Top\n<:Jungle:668845111764844554> Jungle\n<:Mid:668845214533943301> Mid\n<:ADC:668845232401416233> ADC\n<:Support:668845250474803221> Support\n ឵឵`)
}

module.exports.config = {
    name: "reload",
    aliases: []
}