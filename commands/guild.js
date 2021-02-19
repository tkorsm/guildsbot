const Discord = require('discord.js');
const botconfig = require("../config/botconfig.json");
const fs = require("fs");
const isImageUrl = require('is-image-url');
var memberData = JSON.parse(fs.readFileSync('./config/memberData.json', 'utf8'));
var guildData = JSON.parse(fs.readFileSync('./config/guildData.json', 'utf8'));

const guildCooldown = new Set();
const nameCooldown = new Set();

module.exports.run = async (bot, message, args) => {

    let command = args[0]
    let mentionedMember = message.mentions.members.first() || false
    const dmChannel = await message.member.createDM()
    const serverRoles = ["Root", "Guildmaster", "Officer", "Recruiter", "Member", "Developer", "@everyone", "Top", "Jungle", "Mid", "ADC", "Support", "--- Guilds ---", "--- Ranks ---", "--- Roles ---", "--- Misc ---", "Nitro Booster", "Event Organizer", "Caster", "Guildless"]
    const commandList = ["help", "create", "disband", "invite", "kick", "leave", "rank", "color", "info", "status", "banner", "icon", "rating", "refresh"]
    let guildRole = message.member.roles.cache.find(role => !serverRoles.includes(role.name)) || false
    let mentionedGuild = false

    if (mentionedMember) {
        mentionedGuild = mentionedMember.roles.cache.find(role => !serverRoles.includes(role.name)) || false
    }

    let guildPermissions = message.member.roles.cache.find(role => ["Guildmaster", "Officer", "Recruiter", "Member"].includes(role.name)) || 0
    if (!guildPermissions == 0) {
        if (guildPermissions.name == "Guildmaster") guildPermissions = 4
        if (guildPermissions.name == "Officer") guildPermissions = 3
        if (guildPermissions.name == "Recruiter") guildPermissions = 2
        if (guildPermissions.name == "Member") guildPermissions = 1
    }

    let mentionedPermissions = false

    if (mentionedMember) {
        mentionedPermissions = mentionedMember.roles.cache.find(role => ["Guildmaster", "Officer", "Recruiter", "Member"].includes(role.name)) || 0
        if (!mentionedPermissions == 0) {
            if (mentionedPermissions.name == "Guildmaster") mentionedPermissions = 4
            if (mentionedPermissions.name == "Officer") mentionedPermissions = 3
            if (mentionedPermissions.name == "Recruiter") mentionedPermissions = 2
            if (mentionedPermissions.name == "Member") mentionedPermissions = 1
        }
    }

    message.guild.members.cache.forEach(member => {
        if (!memberData[member.id]) memberData[member.id] = {
            summonername: ``,
            rating: 1000,
            wins: 0,
            losses: 0,
        }
    })

    message.guild.roles.cache.forEach(role => {
	    if (!guildData[role.id] && !serverRoles.includes(role.name) || role.id == '669316638239359007') guildData[role.id] = {
		    icon: "https://i.imgur.com/iu40r44.png",
            banner: "https://i.imgur.com/iu40r44.png",
            rating: 1000,
		    wins: 0,
		    losses: 0
		}
    })

    function usage(usage, permission, description, example) {
        const usageEmbed = new Discord.MessageEmbed()
        .setTitle(`**Usage**: ${usage}`)
        .addField(`Permission Level`, `${permission}`)
        .addField(`Description`, `${description}`)
        // .addField(`Example`, `${example}`)
        return usageEmbed
    }

    function gmList(mention) {
        let mentionedGuild = message.guild.roles.cache.find(r => r.name.toLowerCase() == mention.name.toLowerCase())
        let gmList = new Array()
        message.guild.members.cache.forEach(member => {
            if (member.roles.cache.has(mentionedGuild.id) && member.roles.cache.has('551987965090594817')) {
                gmList.push(member)
            }
        })
        return gmList
    }

    function guildEmbed(mention) {
        let guildCount = message.guild.roles.cache.get(mention.id).members
        let ratingAverage = 0
        message.guild.members.cache.forEach(member => {
            if (member.roles.cache.has(mention.id)) {
                ratingAverage += memberData[member.id].rating
            }
        })
        ratingAverage = Math.round(ratingAverage/guildCount.size)
        const guildEmbed = new Discord.MessageEmbed()
        .setColor(mention.color)
        .setAuthor(`${mention.name} | Info`, guildData[mention.id].icon)
        .setTitle('Guild Info')
        .setThumbnail(guildData[mention.id].banner)
        .addField("**Guildmaster**", `${gmList(mention).join(' ')}` || 'None')
        .addField("**Member Count       **", `${guildCount.size}`, true)
        .addField("**Creation Date       **", `${mention.createdAt}`.substring(4, 15), true)
        .addField(`**Rating       **`, `${ratingAverage}`, true)
        .addField("**Record       **", `${guildData[mention.id].wins}W - ${guildData[mention.id].losses}L`, true)
        return guildEmbed
    }

    function userEmbed(mention) {
        let mentionedGuild = mention.roles.cache.find(role => !serverRoles.includes(role.name)) || false
        let userEmbed = new Discord.MessageEmbed()
        .setColor(mentionedGuild.color || 'FFFFFF')
        .setAuthor(`${mention.displayName} | Info`, mention.user.displayAvatarURL)
        .setTitle('User Info')
        .setThumbnail((mentionedGuild == false) ? 'https://i.imgur.com/iu40r44.png':guildData[mentionedGuild.id].banner)
        .addField("**Guild**", `${mentionedGuild || 'None'}`, true)
        .addField("**Join Date**", `${mention.joinedAt}`.substring(4, 15), true)
        .addField("**Rating**", `${memberData[mention.id].rating}`, true)
        .addField("**Record**", `${memberData[mention.id].wins}W - ${memberData[mention.id].losses}L`, true)
        return userEmbed
    }

    function sortRating(array, data) {
        for (var i = 1; i < array.length; i++) {
            if (data[array[i - 1].id].rating > data[array[i].id].rating) {
                for(; i > 0 && data[array[i - 1].id].rating > data[array[i].id].rating; i--) {
                    var t = array[i]
                    array[i] = array[i-1]
                    array[i-1] = t
                }
            }
        }
        return array.reverse()
    }

    if (!commandList.includes(command)) return message.channel.send('Invalid command. Type "!guild help" for a list of commands.')
    if (command == "help") {
        let helpEmbed = new Discord.MessageEmbed()
        .setTitle("**Guild Commands List**")
        .setDescription(`To get a full description and usage, type the command without any arguments.`)
        .addField(`List of Commands`, `!guild create [name]\n!guild disband\n!guild invite @[member]\n!guild kick @[member]\n!guild leave\n!guild rank @[member] [rank]\n!guild info {guild} or @[member]\n!guild color [hexcolor]\n!guild icon [imageurl]\n!guild banner [imageurl]\n!guild status {description}`)
        return message.channel.send(helpEmbed)
    }
    if (command == "create") {
        if (!args[1]) return message.channel.send(usage('!guild create {name}', 'Any', 'Creates a new guild.'))
        if (guildPermissions == 4) return message.channel.send('You already own a guild.')
        if (guildRole) return message.channel.send('You are already part of a guild.')
        if (args[1].length > 18) return message.channel.send('Your guild name must not exceed 18 characters.')
        if (/[^A-Za-z0-9]+/.test(args[1])) return message.channel.send('Your guild name must contain only letters and numbers.')
        if (message.guild.roles.cache.some(role => serverRoles.includes(args[1]))) return message.channel.send('You cannot name your guild that.')
        if (message.guild.roles.cache.find(role => role.name == args.slice(1).join(' '))) return message.channel.send('That guild name has already been taken.')
        let guildName = await args.slice(1)
        let newGuild = await message.guild.roles.create({name: guildName.join(' '), color: 'RANDOM'})
        message.member.roles.add(newGuild)
        message.member.roles.add('551987965090594817')
        message.member.roles.remove('669316638239359007')
        message.guild.setRolePositions([{role: newGuild.id, position: 17}])
        guildData[newGuild.id] = {
            icon: "https://i.imgur.com/iu40r44.png",
            banner: "https://i.imgur.com/iu40r44.png",
            wins: 0,
            losses: 0
        }
        const newAnnouncements = await message.guild.channels.create(`${guildName.join('-')}-announcements`, {
            permissionOverwrites: [{
                id: message.guild.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            },{
                id: newGuild.id,
                allow: ['VIEW_CHANNEL']
            },{
                id: '551987965090594817',
                allow: ['SEND_MESSAGES']
            },{
                id: '551988031293489177',
                allow: ['SEND_MESSAGES']
            }]
        })
        const newChat = await message.guild.channels.create(`${guildName.join('-')}-chat`, {
            permissionOverwrites: [{
                id: message.guild.id,
                deny: ['VIEW_CHANNEL']
            },{
                id: newGuild.id,
                allow: ['VIEW_CHANNEL']
            }]
        })
        const newVoice = await message.guild.channels.create(`${guildName.join('-')}`, {
            type: 'voice',
            permissionOverwrites: [{
                id: message.guild.id,
                deny: ['CONNECT']
            },{
                id: newGuild.id,
                allow: ['CONNECT']
            }]
        })

        newAnnouncements.setParent('551991522103525376')
        newChat.setParent('551991522103525376')
        newVoice.setParent('551991522103525376')
        await newGuild.setHoist(true)
        message.channel.send(`Congratulations, ${newGuild} has been created.`)
    }
    if (command == "disband") {
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions != 4) return message.channel.send("Only a Guildmaster may disband the guild.")
        message.channel.send("Are you sure you want to disband your guild? This cannot be undone. [yes/no]")
        const response = await message.channel.awaitMessages(msg => {
            if (msg.author.id == message.member.id) {
                return msg.content.toLowerCase().includes("yes"), ("no")
            }
        }, {max: 1, time: 10000})
        if (response.map(msg => msg.content.toLowerCase()) == "yes") {
            const oldAnnouncements = message.guild.channels.cache.find(r => r.name == `${guildRole.name.replace(/\s/g, '-').toLowerCase()}-announcements`).delete()
            const oldChat = message.guild.channels.cache.find(r => r.name == `${guildRole.name.replace(/\s/g, '-').toLowerCase()}-chat`).delete()
            const oldVoice = message.guild.channels.cache.find(r => r.name == `${guildRole.name.replace(/\s/g, '-')}`).delete()
            message.guild.members.cache.forEach(member => {
                if (member.roles.cache.has(guildRole.id)) {
                    member.roles.remove('551987965090594817')
                    member.roles.remove('551988031293489177')
                    member.roles.remove('551987147675271168')
                    member.roles.remove('555135774052319262')
                }
            })
            message.member.roles.remove('551987965090594817')
            await guildRole.delete()
            message.channel.send('Your guild has disbanded!')
        }   else if (response.map(msg => msg.content.toLowerCase()) == "no") return message.channel.send("Your guild has not disbanded.")
    }
    if (command == "invite") {
        if (!args[1]) return message.channel.send(usage('!guild invite @[member]', 'Recruiter', 'Invites a member to your guild.'))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions < 2) return message.channel.send("You don't have sufficient permissions.")
        if (mentionedMember == false) return message.channel.send('Invalid member.')
        if (mentionedMember.roles.cache.has(guildRole.id)) return message.channel.send(`That member is already in your guild.`)
        if (mentionedGuild) return message.channel.send(`That member is already in a guild.`)
        if (guildCooldown.has(guildRole.id) && nameCooldown.has(mentionedMember.id)) return message.channel.send('An invitation to that user is still pending.')
        guildCooldown.add(guildRole.id)
        nameCooldown.add(mentionedMember.id)
        setTimeout(() => {
            guildCooldown.delete(guildRole.id)
            nameCooldown.delete(mentionedMember.id)
        }, 86400000);
        message.channel.send(`${mentionedMember.user.tag} has been invited to ${guildRole}. This invite will expire in 1 day.`)
        const mentionedDM = await mentionedMember.createDM()
        mentionedDM.send(`You have been invited to ${guildRole.name}. This invite will expire in 1 day. !accept {guildname}`, {embed: guildEmbed(guildRole)})
        const response = await mentionedDM.awaitMessages(msg => {
            if (msg.author.id === mentionedMember.id) {
                return msg.content.toLowerCase().includes(`!accept ${guildRole.name}`.toLowerCase())
            }
        }, {max: 1, time: 86400000})
        if (response.map(msg => msg.content.toLowerCase()) == `!accept ${guildRole.name}`.toLowerCase()) {
            if (mentionedMember.roles.cache.find(role => !serverRoles.includes(role.name))) return inviteDM.send("You are already in a guild.")
            mentionedDM.send(`Congratulations! You are now a member of ${guildRole.name}.`)
            mentionedMember.roles.add('555135774052319262')
            await mentionedMember.roles.add(guildRole)
        }
    }
    if (command == "kick") {
        if (!args[1]) return message.channel.send(usage('!guild kick @[member]', 'Officer', 'Kicks a member from your guild.'))
        if (!guildRole) return message.channel.send("You are not part of a guild.")        
        if (guildPermissions < 3) return message.channel.send("You don't have sufficient permissions.")
        if (mentionedMember == "None") return message.channel.send('Invalid user.')
        if (mentionedPermissions == 4 || (mentionedPermissions == 3 && !guildPermissions == 4)) return message.channel.send("You cannot kick this user.")
        mentionedMember.roles.remove('551987965090594817')
        mentionedMember.roles.remove('551988031293489177')
        mentionedMember.roles.remove('551987147675271168')
        mentionedMember.roles.remove('555135774052319262')
        await mentionedMember.roles.remove(guildRole)
        message.channel.send(`${mentionedMember.user.tag} has been kicked from ${guildRole}.`)
    }
    if (command == "leave") {
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (gmList(guildRole).length == 1 && message.member.roles.cache.has('551987965090594817')) return message.channel.send('You must promote another member to Guildmaster before leaving.')
        message.channel.send("Are you sure you want to leave your guild? [yes/no]")
        const response = await message.channel.awaitMessages(msg => {
            if (msg.author.id === message.member.id) {
                return msg.content.toLowerCase().includes("yes"), ("no")
            }
        }, {max: 1, time: 10000})
        if (response.map(msg => msg.content.toLowerCase()) == "yes") {
            message.member.removeRole('551987965090594817')
            message.member.removeRole('551988031293489177')
            message.member.removeRole('551987147675271168')
            message.member.removeRole('555135774052319262')
            message.member.removeRole(guildRole)
            message.channel.send('You have left your guild.')
        }   else if (response.map(msg => msg.content.toLowerCase()) == "no") return message.channel.send("You have not left your guild.")
    }
    if (command == "rank") {
        if (!args[2]) return message.channel.send(usage('!guild rank @[member] [rank]', 'Officer', 'Changes the rank of a member in your guild. Ranks: Guildmaster, Officer, Recruiter, Member'))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions < 3) return message.channel.send("You don't have sufficient permissions.")
        if (!["guildmaster", "officer", "recruiter", "member"].includes(args[2].toLowerCase())) return message.channel.send('Invalid rank. Ranks: Guildmaster, Officer, Recruiter, Member')
        if (mentionedPermissions == 4 || (mentionedPermissions == 3 && !guildPermissions == 4)) return message.channel.send("You can only change the ranks of users below your current rank.")
        let newRank = message.guild.roles.cache.find(r => r.name.toLowerCase() == args[2].toLowerCase())
        if (mentionedMember.roles.cache.has(newRank.id)) return message.channel.send('This user already has that rank.')
        if (newRank.id == '551987965090594817') {
            if (guildPermissions == 4) {
                await message.channel.send("Promoting to Guildmaster will allow this user to officially co-own the guild. Are you sure you want to do this? It cannot be undone. [yes/no]")
                const response = await message.channel.awaitMessages(msg => {
                    if (msg.author.id === message.author.id) {
                        return msg.content.includes("yes"), ("no")
                    }
                }, {max: 1, time: 10000})
                if (response.map(msg => msg.content) == "yes") {
                }   else if (response.map(msg => msg.content) == "no") {
                    return message.channel.send('You have not promoted this user.')
                }   else return
            }   else return message.channel.send('Only Guildmasters can promote users to Guildmaster.')
        }
        if (mentionedMember.roles.cache.has(guildRole.id)) {
            mentionedMember.removeRole('551987965090594817')
            mentionedMember.removeRole('551988031293489177')
            mentionedMember.removeRole('551987147675271168')
            mentionedMember.removeRole('555135774052319262')
            mentionedMember.roles.add(newRank)
            message.channel.send(`${mentionedMember.user.tag}'s rank has been changed to ${newRank}.`)
        }   else return message.channel.send('This user is not in your guild.')
    }
    if (command == "color") {
        if (!args[1]) return message.channel.send(usage('!guild color [hexcolor]', 'Guildmaster', 'Changes the color of your guild. Hexcolor is a 6-digit code from 000000 to FFFFFF. Go to www.color-hex.com'))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (!guildPermissions == 4) return message.channel.send("You don't have sufficient permissions.")
        if (/^[0-9A-F]{6}$/i.test(args[1])) {
            if (args[1] == '000000') { 
                guildRole.edit({color: '000001'})
                return message.channel.send(`${guildRole} has been changed to color #000000.`)
            }
            guildRole.edit({color: args[1]})
            return message.channel.send(`${guildRole} has been changed to color #${args[1].toUpperCase()}.`)
        }   else return message.channel.send('Invalid Hexcolor. Must be written out as a 6-digit hexidecimal. Go to www.color-hex.com')
    }
    if (command == "info") {
        if (!args[1]) return message.channel.send(usage('!guild info {guild} or @[member]', 'Any', 'Displays the info of a guild or member.'))
        if (mentionedMember) {
            return message.channel.send({embed: userEmbed(mentionedMember)})
        }   else if (!mentionedMember) {
            mentionedGuild = message.guild.roles.cache.find(r => r.name.toLowerCase() == args.slice(1).join(" ").toLowerCase())
            if (mentionedGuild && !serverRoles.includes(mentionedGuild.name) || args[1].toLowerCase() == 'guildless') {
                return message.channel.send({embed: guildEmbed(mentionedGuild)})
            }   else return message.channel.send('Specified user/guild does not exist. Type !guild info for usage.')
        }
    }
    if (command == "status") {
        if (!args[1]) return message.channel.send(usage('!guild status {description}', 'Officer', 'Changes the status of your current channel.'))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions < 3) return message.channel.send("You don't have sufficient permissions.")
        if (message.channel.parent.id != '551991522103525376') return message.channel.send("You must be in your own guild channel to update the status.")
        message.channel.setTopic(args.slice(1).join(" "))
        /*
        message.channel.send('Your guild status has been updated.')
        .then(msg => {
            msg.delete()
        })
        */
    }
    if (command == "banner") {
        if (!args[1]) return message.channel.send(usage("!guild banner [imageurl]", 'Officer', "Changes the banner image of your guilds info display."))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions < 3) return message.channel.send("You don't have sufficient permissions.")
        if (!isImageUrl(args[1])) return message.channel.send('Error: Invalid image URL.')
        return guildData[guildRole.id].banner = args[1]
    }
    if (command == "icon") {
        if (!args[1]) return message.channel.send(usage("!guild icon [imageurl]", 'Officer', "Changes the icon image of your guilds info display."))
        if (!guildRole) return message.channel.send("You are not part of a guild.")
        if (guildPermissions < 3) return message.channel.send("You don't have sufficient permissions.")
        if (!isImageUrl(args[1])) return message.channel.send('Error: Invalid image URL.')
        return guildData[guildRole.id].icon = args[1]
    }
    if (command == "rating") {
        if (!message.member.hasPermission(["ADMINISTRATOR"])) return message.channel.send("Error: User is not Root.")
        let guildWinner = message.guild.roles.cache.find(r => r.name.toLowerCase() == args[1].toLowerCase())
        let guildLoser = message.guild.roles.cache.find(r => r.name.toLowerCase() == args[2].toLowerCase())
        if(!guildWinner) return message.channel.send("Error: args[1] is not a valid guild.")
        if(!guildLoser) return message.channel.send("Error: args[2] is not a valid guild.")
        var winnerAverage = 0
        var loserAverage = 0
        var winnerCount = 0
        var loserCount = 0
        message.guild.members.forEach(member => {
            if (member.roles.cache.has(guildWinner.id)) {
                winnerAverage += memberData[member.id].rating
                winnerCount += 1
            }
            if (member.roles.cache.has(guildLoser.id)) {
                loserAverage += memberData[member.id].rating
                loserCount += 1
            }
        })
        winnerAverage = Math.round(winnerAverage/winnerCount)
        loserAverage = Math.round(loserAverage/loserCount)
        let K = Math.round(32*(1-(1/(1+10**((loserAverage-winnerAverage)/400)))))
        let leaderboard = `(Won) ${guildWinner}: ${winnerAverage} => ${winnerAverage+K} (+${K}) | (Lost) ${guildLoser}: ${loserAverage} => ${loserAverage-K} (-${K})`
        guildData[guildWinner.id].wins += 1
        guildData[guildLoser.id].losses += 1
        message.guild.members.forEach(member => {
            if (member.roles.cache.has(guildWinner.id)) {
                K = Math.round(32*(1-(1/(1+10**((loserAverage-memberData[member.id].rating)/400)))))
                memberData[member.id].wins += 1
                leaderboard += `\n(${guildWinner}) ${member.user.tag} -- Rating: ${memberData[member.id].rating} => ${memberData[member.id].rating+K} (+${K}), ${memberData[member.id].wins}W - ${memberData[member.id].losses}L`
                memberData[member.id].rating += K
            }
            if (member.roles.cache.has(guildLoser.id)) {
                K = Math.round(32*(1-(1/(1+10**((memberData[member.id].rating-winnerAverage)/400)))))
                memberData[member.id].losses += 1
                leaderboard += `\n(${guildLoser}) ${member.user.tag} -- Rating: ${memberData[member.id].rating} => ${memberData[member.id].rating-K} (-${K}), ${memberData[member.id].wins}W - ${memberData[member.id].losses}L`
                memberData[member.id].rating -= K
            }
        })
        message.channel.send(leaderboard)
    }
    if (command == "reload") {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Error: User is not Root.")
        const selfAssignGuild = bot.guilds.get('551985873265360908')
        const selfAssignChannel = selfAssignGuild.channels.get('668846511404089349')
        const selfAssignMessage = await selfAssignChannel.messages.fetch('669057955714301955')
        selfAssignMessage.edit(`Self-assign your roles by using the reactions below.\n\n<:Top:668845098636673034> Top\n<:Jungle:668845111764844554> Jungle\n<:Mid:668845214533943301> Mid\n<:ADC:668845232401416233> ADC\n<:Support:668845250474803221> Support\n ឵឵`)
        message.channel.send('Successfully reloaded the bot.')
    }

    /*

    let memberGuild = false

    message.guild.roles.forEach(role => {
        if (!serverRoles.includes(role.name)) guildData[role.id].rating = 0
    })

    message.guild.members.forEach(member => {
        memberGuild = member.roles.find(role => !serverRoles.includes(role.name)) || false
        if (memberGuild) guildData[memberGuild.id].rating += memberData[member.id].rating/message.guild.roles.get(memberGuild.id).members.size
    })

    message.guild.roles.forEach(role => {
        if (!serverRoles.includes(role.name)) guildData[role.id].rating = Math.round(guildData[role.id].rating)
    })
    
    let memberList = []
    let guildList = []
    let leaderboard = `User Ratings`
    let guildHeader = message.guild.roles.get("554383847052279829")
    message.guild.members.forEach(member => {
        return memberList.push(member)
    })
    message.guild.roles.forEach(role => {
        if (!serverRoles.includes(role.name)) return guildList.push(role)
    })
    memberList.reverse()
    guildList.reverse()
    sortRating(memberList, memberData)
    sortRating(guildList, guildData)
    for (var i = 0; i != 10 && i < memberList.length; i++) {
        leaderboard += `\n#${i+1}  (${memberList[i].roles.find(role => !serverRoles.includes(role.name)) || 'None'})  ${memberList[i]} -- Rating: ${memberData[memberList[i].id].rating}`
    }
    leaderboard += `\n\nGuild Ratings`
    for (var i = 0; i != 5 && i < guildList.length; i++) {
        leaderboard += `\n#${i+1}  ${guildList[i]} -- Rating: ${guildData[guildList[i].id].rating}`
    }
    if (command != "disband") {
        for (var i = 0; i != 3 && i < guildList.length; i++) {
            if (i == 0) await message.guild.setRolePosition(guildList[i].id, guildHeader.calculatedPosition - 1)
            if (i > 0) await message.guild.setRolePosition(guildList[i].id, guildList[i-1].calculatedPosition - 1)
        }
    }
    const ratingChannel = message.guild.channels.get('578246232426676234')
    const ratingMessage = await ratingChannel.fetchMessage('578250500076601354')
    ratingMessage.edit(leaderboard)

    fs.writeFile('./config/guildData.json', JSON.stringify(guildData, null, 4), (err) => {
        if (err) console.error(err)
    })
    fs.writeFile('./config/memberData.json', JSON.stringify(memberData, null, 4), (err) => {
        if (err) console.error(err)
    })
    */
}

module.exports.config = {
    name: "guild",
    aliases: []
}
