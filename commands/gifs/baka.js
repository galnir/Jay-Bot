const fetch = require('node-fetch');
const { tenorAPI, prefix } = require('../../config.json');
const fs = require('fs');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class BakaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'baka',
            aliases: [
                'animebaka',
                'bakagif'
            ],
            group: 'gifs',
            memberName: 'baka',
            description: 'Call a specified user baka!',
            examples: [
                '`' + prefix + 'baka @johndoe'
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
            const baka_list = fs.readFileSync('././resources/gifs/baka_answers.json', 'utf8');
            const baka_Array = JSON.parse(baka_list).answers;
            const baka_answers =
                baka_Array[Math.floor(Math.random() * baka_Array.length)];
            fetch(
                    'https://g.tenor.com/v1/random?key=' + tenorAPI + '&q=anime-baka&limit=1'
                )
                .then(res => res.json())
                .then(json => {
                    embed.setDescription('**' + message.mentions.users.first().username + '** made ' + '**' + message.author.username + '**' + ' ' + baka_answers.text + '... baka!\n')
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