const { CommandoClient } = require('discord.js-commando');
const { Structures, MessageEmbed, MessageAttachment } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const db = require('quick.db');
const Canvas = require('canvas');

Structures.extend('Guild', function(Guild) {
  class GuildData extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        queueHistory: [],
        isPlaying: false,
        isPreviousTrack: false,
        nowPlaying: null,
        songDispatcher: null,
        skipTimer: false, // only skip if user used leave command
        loopSong: false,
        loopQueue: false,
        volume: 1
      };
      this.triviaData = {
        isTriviaRunning: false,
        wasTriviaEndCalled: false,
        triviaQueue: [],
        triviaScore: new Map()
      };
      this.twitchData = {
        Interval: null,
        embedStatus: null,
        isRunning: false
      };
      this.gameData = {
        connect4Players: new Map(),
        tictactoePlayers: new Map()
      };
    }
    resetMusicDataOnError() {
      this.musicData.queue.length = 0;
      this.musicData.isPlaying = false;
      this.musicData.nowPlaying = null;
      this.musicData.loopSong = false;
      this.musicData.loopQueue = false;
      this.musicData.songDispatcher = null;
    }
  }
  return GuildData;
});

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: discord_owner_id
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['music', ':notes: Music Command Group:'],
    ['gifs', ':film_frames: Gif Command Group:'],
    ['nsfw', ':no_entry: NSFW Command Group'],
    ['other', ':loud_sound: Other Command Group:'],
    ['guild', ':gear: Guild Related Commands:'],
    ['speedrun', ':athletic_shoe: Speedrun Related Commands:'],
    ['dev', ':gear: Developer Command Group']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    unknownCommand: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log(`${client.user.tag} is Ready!`);
  client.user.setActivity(`${prefix}help`, {
    type: 'WATCHING',
    url: 'https://github.com/galnir/Master-Bot'
  });
  const Guilds = client.guilds.cache.map(guild => guild.name);
  console.log(Guilds, 'Connected!');
  // Registering font For Cloud Services
  Canvas.registerFont('./resources/welcome/OpenSans-Light.ttf', {
    family: 'Open Sans Light'
  });
});
client.on('voiceStateUpdate', async (___, newState) => {
  if (
    newState.member.user.bot &&
    !newState.channelID &&
    newState.guild.musicData.songDispatcher &&
    newState.member.user.id == client.user.id
  ) {
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.songDispatcher.end();
    return;
  }
  if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
  ) {
    newState.setSelfDeaf(true);
  }
});

client.on('guildMemberAdd', async member => {
  //Grab DB 1 get
  const serverSettingsFetch = db.get(member.guild.id);
  if (!serverSettingsFetch || serverSettingsFetch == null) return;

  const welcomeMsgSettings = serverSettingsFetch.serverSettings.welcomeMsg;
  if (welcomeMsgSettings == undefined) return;

  if (welcomeMsgSettings.status == 'no') return;

  if (welcomeMsgSettings.status == 'yes') {
    var applyText = (canvas, text) => {
      const ctx = canvas.getContext('2d');
      let fontSize = 70;

      do {
        ctx.font = `${(fontSize -= 10)}px Open Sans Light`; // This needs to match the family Name on line 65
      } while (ctx.measureText(text).width > canvas.width - 300);

      return ctx.font;
    };

    // Customizable Welcome Image Options
    var canvas = await Canvas.createCanvas(
      welcomeMsgSettings.imageWidth,
      welcomeMsgSettings.imageHeight
    );
    var ctx = canvas.getContext('2d');

    // Background Image Options
    var background = await Canvas.loadImage(welcomeMsgSettings.wallpaperURL);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Background Image Border Options
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Upper Text Options
    ctx.font = '26px Open Sans Light'; // if the font register changed this needs to match the family Name on line 65
    ctx.fillStyle = '#FFFFFF'; // Main Color of the Text on the top of the welcome image
    ctx.fillText(
      welcomeMsgSettings.topImageText
        .replace(/\{serverName\}/gi, member.guild.name)
        .replace(/\{memberName\}/gi, member.displayName)
        .replace('default', `Welcome to ${member.guild.name}`),
      canvas.width / 2.5,
      canvas.height / 3.5
    );
    ctx.strokeStyle = `#FFFFFF`; // Secondary Color of Text on the top of welcome for depth/shadow the stroke is under the main color
    ctx.strokeText(
      welcomeMsgSettings.topImageText
        .replace(/\{serverName\}/gi, member.guild.name)
        .replace(/\{memberName\}/gi, member.displayName)
        .replace('default', `Welcome to ${member.guild.name}`),
      canvas.width / 2.5,
      canvas.height / 3.5
    );

    //Lower Text Options
    ctx.font = applyText(canvas, `${member.displayName}!`);
    ctx.fillStyle = '#FFFFFF'; // Main Color for the members name for the welcome image
    ctx.fillText(
      welcomeMsgSettings.bottomImageText
        .replace(/\{serverName\}/gi, member.guild.name)
        .replace(/\{memberName\}/gi, member.displayName)
        .replace('default', `${member.displayName}!`),
      canvas.width / 2.5,
      canvas.height / 1.8
    );
    ctx.strokeStyle = `#FF0000`; // Secondary Color for the member name to add depth/shadow to the text
    ctx.strokeText(
      welcomeMsgSettings.bottomImageText
        .replace(/\{serverName\}/gi, member.guild.name)
        .replace(/\{memberName\}/gi, member.displayName)
        .replace('default', `${member.displayName}!`),
      canvas.width / 2.5,
      canvas.height / 1.8
    );

    // Avatar Shape Options
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true); // Shape option (circle)
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({
        format: 'jpg'
      })
    );
    ctx.drawImage(avatar, 25, 25, 200, 200);
    // Image is Built and Ready
    const attachment = new MessageAttachment(
      canvas.toBuffer(),
      'welcome-image.png'
    );

    // Welcome Embed Report
    var embed = new MessageEmbed()
      .setColor(`RANDOM`)
      .attachFiles(attachment)
      .setImage('attachment://welcome-image.png')
      .setFooter(`Type help for a feature list!`)
      .setTimestamp()
      .setTitle(
        welcomeMsgSettings.embedTitle
          .replace(/\{serverName\}/gi, member.guild.name)
          .replace(/\{memberName\}/gi, member.displayName)
          .replace(
            'default',
            `:speech_balloon: Hey ${member.displayName}, You look new to ${member.guild.name}!`
          )
      );

    // Sends a DM if set to or if destination is not present in DB(pre channel option users)
    if (
      welcomeMsgSettings.destination == 'direct message' ||
      !welcomeMsgSettings.destination
    )
      try {
        await member.user.send(embed);
      } catch {
        console.log(`${member.user.username}'s dms are private`);
      }

    // Sends to assigned Channel from DB
    if (welcomeMsgSettings.destination != 'direct message') {
      const channel = member.guild.channels.cache.find(
        channel => channel.name === welcomeMsgSettings.destination
      );
      await channel.send(`${member}`);
      await channel.send(embed);
    }
  }
});

client.login(token);
