// const fetch = require("node-fetch");
// const { tenorAPI } = require("../config.json");
const fs = require('fs');
const { Command } = require('discord.js-commando');

module.exports = class GintamaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gintama',
      group: 'gifs',
      memberName: 'gintama',
      description: 'Replies with a gintama gif!',
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    try {
      const linkArray = fs
        .readFileSync('././resources/gifs/sfw/Gintama.txt', 'utf8')
        .split('\n');
      const link = linkArray[Math.floor(Math.random() * linkArray.length)];
      message.channel.send(link);
      return;

      /*
      I changed the command from calling the tenor api each time someone
      uses the !gintama command for 2 main reasons:
      
      1. The tenor api doesn't always respond with a valid gintama gif, sometimes
      it responds with a wrong gif.
      2. Instead of waiting for the api we can just pick a random link from
      the gintamalinks file so the response is faster.
      You can still use the old method, it's commented out down below, and
      don't forget to uncomment the require for node-fetch and tenorAPI above
    
      
       fetch(
        `https://g.tenor.com/v1/random?key=${tenorAPI}&q=gintama&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url))
        .catch(e => {
          message.reply('Failed to fetch a gintama gif :slight_frown:');
          return console.error(e);
        })
      */
    } catch (e) {
      message.reply(':x: Failed to fetch a gintama gif!');
      return console.error(e);
    }
  }
};
