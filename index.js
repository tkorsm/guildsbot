const Discord = require("discord.js");
const botconfig = require("./config/botconfig.json");
const client = new Discord.Client({
    autoReconnect: true,
    partials: ['MESSAGE']
});
const coinsData = require("./config/coinsData.json");

client.on('error', () => {});

client.on("ready", async() => {
    console.log(`node index.js is loaded`)
    client.user.setActivity("!guild help", {type: "PLAYING"});
    // const lolGW = client.guilds.fetch('222078108977594368')
    // .then(guild => console.log(guild.name))
    // .catch(console.error);
    // const selfAssignChannel = await lolGW.channels.resolve('668846511404089349')
    // const selfAssignMessage = await selfAssignChannel.messages.resolve('669057955714301955')
    // selfAssignMessage.edit(`Self-assign your roles by using the reactions below.\n\n<:Top:668845098636673034> Top\n<:Jungle:668845111764844554> Jungle\n<:Mid:668845214533943301> Mid\n<:ADC:668845232401416233> ADC\n<:Support:668845250474803221> Support\n ឵឵`)
})

const fs = require("fs");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        return console.log("[LOGS] Couldn't Find Commands!");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        client.commands.set(pull.config.name, pull);
        pull.config.aliases.forEach(alias => {
            client.aliases.set(alias, pull.config.name)
        });
    });
});

client.on("message", async message => {

    if (message.author.bot || message.channel.type === "dm") return;

    console.log(`${message.author.tag} in #${message.channel.name}: ${message.content}`)

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ")
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if (!coinsData[message.author.id]) coinsData[message.author.id] = {
        coins: 0
    }
    coinsData[message.author.id].coins += Math.floor(Math.random() * 15) + 1

    if(!message.content.startsWith(prefix)) return fs.writeFile("./config/coinsData.json", JSON.stringify(coinsData, null, 4), (err) => {
        if (err) console.log(err)
    })
    let commandfile = client.commands.get(command.slice(prefix.length)) || client.commands.get(client.aliases.get(command.slice(prefix.length)))
    if (commandfile) commandfile.run(client, message, args)

})
/*
    .on("messageReactionAdd", async (reaction, user) => {

    let msg = await reaction.message.fetch();
    if (msg.channel.id = '668846511404089349') {
        let emoji = reaction.emoji
        if (emoji.id != '668845098636673034' && emoji.id != '668845111764844554' && emoji.id != '668845214533943301' && emoji.id != '668845232401416233' && emoji.id != '668845250474803221') {
            for (const illegalUser of reaction.users.values()) {
                await reaction.users.remove(illegalUser);
            }
            return
        }
        let role = reaction.message.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase())
        let member = reaction.message.guild.members.find(member => member.id === user.id)
        await member.roles.add(role)
    }

})

    .on("messageReactionRemove", async (reaction, user) => {

    let msg = await reaction.message.fetch()
    if (msg.channel.id = '668846511404089349') {
        let emoji = reaction.emoji
        if (emoji.id != '668845098636673034' && emoji.id != '668845111764844554' && emoji.id != '668845214533943301' && emoji.id != '668845232401416233' && emoji.id != '668845250474803221') return
        let role = reaction.message.guild.roles.find(role => role.name.toLowerCase() === emoji.name.toLowerCase())
        let member = reaction.message.guild.members.find(member => member.id === user.id)
        await member.roles.remove(role)
    }

})
*/

client.login(botconfig.token);