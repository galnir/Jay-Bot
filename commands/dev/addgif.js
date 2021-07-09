const fs = require('fs');
const { Command } = require('discord.js-commando');
const { prefix } = require('../../config.json');

module.exports = class AddGifCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addgif',
            aliases: ['add-gif', 'agif'],
            memberName: 'addgif',
            group: 'dev',
            description: 'Adds a Gif to the Gif commands.',
            examples: [
                '`' + prefix + 'addgif nsfw Hentai https://hentai-gif.gif"`',
                '`' + prefix + 'addgif sfw Jojo https://jojo-gif.gif"`'
            ],
            guildOnly: false,
            userPermissions: [
                'MANAGE_GUILD',
                'MANAGE_MESSAGES',
                'SEND_MESSAGES'
            ],
            clientPermisiions: [
                'MANAGE_GUILD',
                'MANAGE_MESSAGES',
                'SEND_MESSAGES'
            ],
            args: [{
                    key: 'gifCategory',
                    prompt: 'Is the gif SFW or NSFW?',
                    type: 'string'
                },
                {
                    key: 'txtFilePath',
                    prompt: 'Please select a File Name from the list below:\n\n**__SFW__**\n\nGintama\nJojo\n\n**__NSFW__**\n\nBlowjob\nBoobs\nHentai\nFurry\nFuta\nTrap\n',
                    type: 'string'
                },
                {
                    key: 'Url',
                    prompt: 'Which gif would you like to add?',
                    type: 'string'
                }
            ],
            throttling: {
                usages: 2,
                duration: 8
            }
        });
    }

    async run(message, { gifCategory, txtFilePath, Url }) {
        if (message.member.roles.cache.some(r => [
                'ROLE_ID',
                'ROLE_ID'
            ].includes(r.id))) {

            fs.writeTxtFILE('././resources/gifs/' + gifCategory + '/' + txtFilePath + '.txt', Url + '\n', { flag: 'a+' }, (err) => {
                if (err) return console.error(err)
                else return message.channel.send('<a:legit_tick:834269513498492968> Successfully added `' + Url + '` to `../../resources/gifs/' + gifCategory + '/' + txtFilePath + '/.txt`')
            })
        } else {
            return message.channel.send(':x: This command can only be used by my Developers...').catch(err => {
                console.error(err)
            })
        }
    }
};
