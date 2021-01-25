const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const PlayCommand = require('./play');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Display the currently playing song!'
    });
  }

  run(message) {
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    const video = message.guild.musicData.nowPlaying;
    let description;
    if (video.duration == 'Live Stream') {
      description = ':red_circle: Live Stream';
    } else {
      description = NowPlayingCommand.playbackBar(message, video);
    }

    var embedTitle = `:musical_note: ${video.title}`;

    if (message.guild.musicData.loopQueue == true)
      embedTitle = `:repeat: ${video.title} **Queue On Loop**`;
    if (message.guild.musicData.loopSong == true)
      embedTitle = `:repeat_one: ${video.title} **On Loop**'`;
    if (message.guild.musicData.songDispatcher.paused == true)
      embedTitle = `:pause_button: ${video.title}`;

    const nowPlayingArr = [
      new MessageEmbed()
        .setThumbnail(video.thumbnail)
        .setColor('#e9f931')
        .setTitle(embedTitle)
        .setURL(video.url)
        .setDescription(description)
        .addField(
          'Volume',
          ':loud_sound: ' +
            (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
            '%',
          true
        )
    ];

    const channelInfo = message.member.voice.channel.members;
    const rawMembers = Object.fromEntries(channelInfo);
    const memberArray = [Object.keys(rawMembers)];

    var videoEmbed = new Pagination.Embeds()
      .setArray(nowPlayingArr)
      .setAuthorizedUsers(memberArray[0])
      .setChannel(message.channel)
      .setDisabledNavigationEmojis(['delete'])
      .setFunctionEmojis({
        // Volume down
        '🔉': (_, instance) => {
          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description);
          if (message.guild.musicData.songDispatcher.volume > 0) {
            const embed = instance.array[0];
            embed.fields[0].value =
              ':loud_sound: ' +
              (
                [message.guild.musicData.songDispatcher.volume - 0.01] * 100
              ).toFixed(0) +
              '%';
            return PlayCommand.volumeDown(message);
          }
        },

        // Volume up
        '🔊': (_, instance) => {
          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description);
          if (message.guild.musicData.songDispatcher.volume < 2) {
            const embed = instance.array[0];
            embed.fields[0].value =
              ':loud_sound: ' +
              (
                (message.guild.musicData.songDispatcher.volume + 0.01) *
                100
              ).toFixed(0) +
              '%';
          }
          return PlayCommand.volumeUp(message);
        },

        // Stop
        '⏹️': (_, instance) => {
          const embed = instance.array[0];

          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description).setTimeout(100);
          embed.title = `:stop_button: ${video.title}`;
          return PlayCommand.stopTheMusic(message);
        },

        // Play/Pause
        '⏯️': (_, instance) => {
          const embed = instance.array[0];

          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description);
          if (message.guild.musicData.songDispatcher.paused == false) {
            embed.title = `:pause_button: ${video.title}`;
          } else {
            embed.title = `:musical_note: ${video.title}`;
          }
          return PlayCommand.playPause(message);
        }
      });

    if (
      message.guild.musicData.queue.length > 0 &&
      !message.guild.musicData.loopSong
    ) {
      videoEmbed
        .addField(
          'Queue',
          ':notes: ' + message.guild.musicData.queue.length + ' Song(s)',
          true
        )
        .addField(
          'Next Song',
          `:track_next: [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
        )

        // Next track
        .addFunctionEmoji('⏭️', (_, instance) => {
          const embed = instance.array[0];
          embed.title = `:next_track: Skipped ${video.title}`;
          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description).setTimeout(100);
          return PlayCommand.nextTrack(message);
        })

        // Repeat Queue
        .addFunctionEmoji('🔁', (_, instance) => {
          const embed = instance.array[0];

          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description);
          if (message.guild.musicData.loopQueue) {
            embed.title = `:musical_note: ${video.title}`;
          } else {
            embed.title = `:repeat: ${video.title} **On Loop**`;
          }
          return PlayCommand.repeatQueue(message);
        });
    } else
      videoEmbed.addFunctionEmoji(
        // Repeat
        '🔂',
        (_, instance) => {
          const embed = instance.array[0];

          if (video.duration == 'Live Stream') {
            description = ':red_circle: Live Stream';
          } else {
            description = NowPlayingCommand.playbackBar(message, video);
          }
          videoEmbed.setDescription(description);
          if (message.guild.musicData.loopSong) {
            embed.title = `:musical_note:  ${video.title}`;
          } else {
            embed.title = `:repeat_one: ${video.title} **On Loop**`;
          }
          return PlayCommand.repeatSong(message);
        }
      );
    return videoEmbed.build();
  }

  static playbackBar(message, video) {
    const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
    const passedTimeInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
    };
    const passedTimeFormatted = NowPlayingCommand.formatDuration(
      passedTimeInMSObj
    );

    const totalDurationObj = video.rawDuration;
    const totalDurationFormatted = NowPlayingCommand.formatDuration(
      totalDurationObj
    );

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
      }
    });
    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );
    let playBack = '';
    for (let i = 1; i < 21; i++) {
      if (playBackBarLocation == 0) {
        playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
        break;
      } else if (i == playBackBarLocation * 2) {
        playBack = playBack + ':musical_note:';
      } else {
        playBack = playBack + '▬';
      }
    }
    playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
    return playBack;
  }
  // prettier-ignore
  static formatDuration(durationObj) {
      const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
        durationObj.minutes ? durationObj.minutes : '00'
      }:${
        (durationObj.seconds < 10)
          ? ('0' + durationObj.seconds)
          : (durationObj.seconds
          ? durationObj.seconds
          : '00')
      }`;
      return duration;
  }
};
