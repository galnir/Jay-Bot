const fetch = require('node-fetch');
const config = require('../../config.json');
const fs = require('fs');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

if (!config.tenorAPI) return;

module.exports = class SlapCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'slap',
            group: 'gifs',
            memberName: 'slap',
            description: 'Slap a specified user.',
            examples: [
                '`' + config.prefix + 'slap @user'
            ],
            throttling: {
                usages: 2,
                duration: 8
            }
        });
    }

    run(message) {
        const embed = new MessageEmbed();
        if (message.mentions.users.first()) {
            fetch(
                    'https://g.tenor.com/v1/random?key=' + config.tenorAPI + '&q=anime-slap&limit=1'
                )
                .then(res => res.json())
                .then(json => {
                    embed.setDescription('**' + message.author.username + '**' + ' slapped ' + '**' + message.mentions.users.first().username + '**')
                    embed.setColor("RANDOM")
                    embed.setImage(json.results[0].media[0].gif.url);
                    message.channel.send(embed)
                });

        } else {
            message.channel.send("You have to mention a user")
                .catch(err => {
                    message.channel.send(':x: Something went wrong.... If the problem continues, please contact support.');
                    return console.error(err);
                })
        }
    }
};