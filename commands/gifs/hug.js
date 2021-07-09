const fetch = require('node-fetch');
const { tenorAPI, prefix } = require('../../config.json');
const fs = require('fs');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class hugCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hug',
            aliases: [
                'huggif',
                'animehug'
            ],
            group: 'gifs',
            memberName: 'hug',
            description: 'Hug a specified user.',
            examples: [
                '`' + prefix + 'hug @user'
            ],
            throttling: {
                usages: 2,
                duration: 8
            }
        });
    }

    run(message) {
        if (message.mentions.users.first()) {
            const embed = new MessageEmbed();
            fetch(
                    'https://g.tenor.com/v1/random?key=' + tenorAPI + '&q=anime-hug&limit=1'
                )
                .then(res => res.json())
                .then(json => {
                    embed.setDescription('**' + message.author.username + '**' + ' hugged ' + '**' + message.mentions.users.first().username + '**')
                    embed.setColor("RANDOM")
                    embed.setImage(json.results[0].media[0].gif.url);
                    message.channel.send(embed)
                })
        } else {
            message.channel.send("You have to mention a user")
            .catch(function onError(err) {
                message.channel.send(':x: Something went wrong.... If the problem continues, please contact support.');
                return console.error(err);
            })
        }
    };
};