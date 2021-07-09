// const fetch = require("node-fetch");
// const { tenorAPI } = require("../config.json");
const fs = require('fs');
const { Command } = require('discord.js-commando');

module.exports = class JojoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jojo',
      aliases: ['jojo-gif', 'jojo-gifs'],
      group: 'gifs',
      memberName: 'jojo',
      description: 'Replies with a random jojo gif!',
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    try {
      const linkArray = fs
        .readFileSync('././resources/gifs/sfw/Jojo.txt', 'utf8')
        .split('\n');
      const link = linkArray[Math.floor(Math.random() * linkArray.length)];
      message.channel.send(link);
      return;

      /*
      I changed the command from calling the tenor api each time someone
      uses the !jojo command for 2 main reasons:
      
      1. The tenor api doesn't always respond with a valid jojo gif, sometimes
      it responds with a wrong gif.
      2. Instead of waiting for the api we can just pick a random link from
      the jojolinks file so the response is faster.
      You can still use the old method, it's commented out down below, and
      don't forget to uncomment the require for node-fetch and tenorAPI above
      */

      /*
      fetch(
        `https://g.tenor.com/v1/random?key=${tenorAPI}&q=jojos-bizarre-adventure&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url))
        .catch(e => {
          message.reply('Failed to fetch a gif :slight_frown:');
          return console.error(e);
        })
      */
    } catch (e) {
      message.reply(':x: Failed to fetch a gif!');
      return console.error(e);
    }
  }
};
