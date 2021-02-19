const Discord = require("discord.js");
const botconfig = require("../config/botconfig.json");
const fs = require("fs");
var memberData = JSON.parse(fs.readFileSync('./config/memberData.json', 'utf8'));
var seedrandom = require('seedrandom');
const { Kayn, REGIONS } = require('kayn')
const api = Kayn('HIDDEN')({
    region: REGIONS.NORTH_AMERICA,
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false,
    },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
        },
    },
})

const userCooldown = new Set();

module.exports.run = async (bot, message, args) => {

    // return message.channel.send('This feature is currently disabled.')

    let command = args[0]
    const dmChannel = await message.member.createDM()

    message.guild.members.forEach(member => {
        if (!memberData[member.id]) memberData[member.id] = {
            summonername: ``,
            rating: 1000,
            wins: 0,
            losses: 0,
        }
    })

    if (!memberData[message.member.id].summonername == '') return message.channel.send('Your account has already been verified. Please contact the server admin if you wish to reset your account.')
    if (userCooldown.has(message.member.id)) return message.channel.send('You must wait 1 minute before issuing this command.')
    message.channel.send('Follow the instructions sent to you through direct message to verify your account.')
    userCooldown.add(message.member.id)
    setTimeout(() => {
        userCooldown.delete(message.member.id)
    }, 60000);

    var seed = await seedrandom(message.member.id)
    const privateID = 'lolgw-' + String(seed()).substring(11)

    async function getSummoner() {
        dmChannel.send(`Enter your summoner name:`)

        const msgs = await dmChannel.awaitMessages(msg => {
            if (msg.author.id === message.author.id) {
                return msg.content
            }
        }, {max: 1, time: 5000})

        if (!msgs.map(msg => msg.content)) return dmChannel.send(`Your request has timed out.`)

        try {
            const summoner = await api.Summoner.by.name(msgs.map(msg => msg.content))
        } catch ({ statusCode }) {
            if (statusCode == 404) {
                dmChannel.send(`Invalid summoner name. Try again.`)
                return getSummoner()
            }
        }

        return api.Summoner.by.name(msgs.map(msg => msg.content))
    }

    const summoner = await getSummoner()

    console.log(`checking summoner_name: ${summoner.name}, summoner_id: ${summoner.id}`)

    await dmChannel.send(`To verify that you are ${summoner.name}, enter ${privateID} into the Verification box and hit Save. Your account will be automatically verified within an hour. (If you have already used Third Party Verification during your current login session, you may need to relog.)`, {
        files: ['https://cdn.discordapp.com/attachments/562789097316286477/563104123877064712/lolverify.png']
    })

    let i = 60

    var intervalID = setInterval(callback, 10000)

    async function callback() {
        if (i == 0) {
            return dmChannel.send(`Your account has not been verified. Please try again or contact a server admin for manual verification.`)
        }   else i--
        try {
            const publicID = await api.ThirdPartyCode.by.summonerID(summoner.id)
        } catch ({ statusCode }) {
            if (statusCode == 404) {
                return
            }
        }
        const publicID = await api.ThirdPartyCode.by.summonerID(summoner.id)
        if (privateID == publicID) {
            memberData[message.member.id].summonername = summoner.name
            clearInterval(intervalID)
            dmChannel.send(`Success. Your account has been verified.`)
            fs.writeFile('./config/memberData.json', JSON.stringify(memberData, null, 4), (err) => {
                if (err) console.error(err)
            })
        }
    }
}

module.exports.config = {
    name: "verify",
    aliases: []
}
