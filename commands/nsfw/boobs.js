const fs = require('fs');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = class BoobsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'boobs',
            aliases: [
                'boob-gif',
                'bgif'
            ],
            group: 'nsfw',
            memberName: 'boobs',
            description: 'Generate a random boobs gif and/or image',
            userPermissions: [
                'SEND_MESSAGES',
                'EMBED_LINKS'
            ],
            clientPermissions: [
                'SEND_MESSAGES',
                'EMBED_LINKS'
            ],
            examples: [
                prefix + 'boobs'
            ],
            throttling: {
                usages: 2,
                duration: 8
            }
        });
    }

    run(message) {
        if (message.channel.nsfw) {
            try {
                const linkArray = fs
                    .readFileSync('././resources/gifs/nsfw/Boobs.txt', 'utf8')
                    .split('\n');
                const link = linkArray[Math.floor(Math.random() * linkArray.length)];
                var embed = new MessageEmbed()
                    .setDescription('[Image Link](' + link + ')')
                    .setColor('RANDOM')
                    .setImage(link);
                message.channel.send(embed);
                return;
            } catch (err) {
                message.reply(
                    '```css\n[ERROR] Discord API Error: ' + err.code + '(' + err.message + '\n```)'
                );
                return console.error(err);
            }
        } else {
            return message.channel.send(':x: This command can only be used in NSFW channels...')
        }
    }
};