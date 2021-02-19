const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");
const fs = require("fs");
var memberData = JSON.parse(fs.readFileSync('./config/memberData.json', 'utf8'));
var guildData = JSON.parse(fs.readFileSync('./config/guildData.json', 'utf8'));
var eventData = JSON.parse(fs.readFileSync('./config/eventData.json', 'utf8'));

module.exports.run = async (bot, message, args) => {

    const serverRoles = ["Root", "Guildmaster", "Officer", "Recruiter", "Member", "Developer", "@everyone", "Top", "Jungle", "Mid", "ADC", "Support", "--- Guilds ---", "--- Ranks ---", "--- Roles ---", "--- Staff ---"]
    let guildRole = message.member.roles.find(role => !serverRoles.includes(role.name)) || false

    message.guild.members.forEach(member => {
        if (!memberData[member.id]) memberData[member.id] = {
            summonername: ``,
            rating: 1000,
            wins: 0,
            losses: 0,
        }
    })
    
    // if (memberData[message.member.id].summonername == '') return message.channel.send('You must verify your League of Legends account before participating in events. Use !verify')
    // if (!guildRole) return message.channel.send('You must be in a guild to participate in events.')
    if (eventData.event == "none") return message.channel.send('There is no active event.')
    // if (!args[1]) return message.channel.send('Please enter which event you would like to signup for. !signup {eventname}')
    if (eventData.participants.includes(message.member.id)) return message.channel.send('You are already signed up for this event.')
    eventData.participants.push(message.member.id)
    message.channel.send(`You have signed up for this event.`)
    const signupChannel = message.guild.channels.get('561717049840238612')
    signupChannel.send(`(${guildRole}) ${message.member} has signed up for the event.`)
    
    fs.writeFile('./config/memberData.json', JSON.stringify(memberData, null, 4), (err) => {
        if (err) console.error(err)
    })
    fs.writeFile('./config/eventData.json', JSON.stringify(eventData, null, 4), (err) => {
        if (err) console.error(err)
    })
}

module.exports.config = {
    name: "signup",
    aliases: []
}