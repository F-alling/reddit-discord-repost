import { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const channelsFile = './channels.json';
const POSTS_LIMIT = 50;
const COMMAND_PREFIX = '!';

const MIN_POST_INTERVAL = 12;  // Min time in minutes
const MAX_POST_INTERVAL = 32; // Max time in minutes

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;
const ACC_TOK = process.env.token // This is base64 of CLIENT_ID:CLIENT_SECRET 
const CHOSEN_SUBREDDITS = [
  'subreddit1', 'subreddit2', 'subreddit3' // subreddit from where to fetch images (dont include r/)
];
const SORT_METHODS = ['hot', 'top', 'new'];


let allowedChannels = [];
if (fs.existsSync(channelsFile)) {
  allowedChannels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

sendRandomPosts()
// controls chances of posting
function getRandomSubreddit() {
  const randomIndex = Math.random() < 0.5
    ? Math.floor(Math.random() * 0.5)
    : Math.floor(Math.random() * CHOSEN_SUBREDDITS.length);
  return CHOSEN_SUBREDDITS[randomIndex];
}

function getRandomPostType() {
  return SORT_METHODS[Math.floor(Math.random() * SORT_METHODS.length)];
}

async function getImagePosts(subreddit, postType = 'hot', limit = 50) {
  const url = `https://oauth.reddit.com/r/${subreddit}/${postType}.json?limit=${limit}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.ACC_TOK}`, // this is the base64 of client_id:client_secret
        'User-Agent': process.env.REDDIT_USER_AGENT || 'MyRedditBot/1.0.0'
      }
    });
    const data = await response.json();


    if (!data || !data.data || !data.data.children) {
      console.error('Unexpected response structure:', data);
      return [];
    }

    return data.data.children
      .map(post => post.data)
      .filter(post => post.url_overridden_by_dest?.match(/\.(jpg|jpeg|png|gif)$/i))
      .map(post => ({
        title: post.title,
        imageUrl: post.url_overridden_by_dest,
        permalink: `https://reddit.com${post.permalink}`,
        author: post.author,
      }));
  } catch (error) {
    console.error(`Error fetching subreddit data: ${error.message}`);
    return [];
  }
}

function saveAllowedChannels() {
  fs.writeFileSync(channelsFile, JSON.stringify(allowedChannels, null, 2));
}

async function sendRandomPosts() {
  for (const channelId of allowedChannels) {
    const randomInterval = Math.floor(Math.random() * (MAX_POST_INTERVAL - MIN_POST_INTERVAL + 1) + MIN_POST_INTERVAL) * 60 * 1000;
    console.log('Next post will be sent in', randomInterval / 1000, 'seconds');
    setTimeout(async () => {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return;

      const subreddit = getRandomSubreddit();
      const postType = getRandomPostType();
      const imagePosts = await getImagePosts(subreddit, postType, POSTS_LIMIT);

      if (imagePosts.length === 0) return;

      const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
      const embed = new EmbedBuilder()
        .setTitle(randomPost.title)
        .setURL(randomPost.permalink)
        .setImage(randomPost.imageUrl)
        .setFooter({ text: `Posted by u/${randomPost.author} on r/${subreddit}` })
        .setColor(0xff69b4);

      await channel.send({ embeds: [embed] }).catch(console.error);
    }, randomInterval);
  }

  setTimeout(sendRandomPosts, Math.floor(Math.random() * (MAX_POST_INTERVAL - MIN_POST_INTERVAL + 1) + MIN_POST_INTERVAL) * 60 * 1000);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(COMMAND_PREFIX)) return;

  const args = message.content.slice(COMMAND_PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  
  if (command === 'post') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You need 'Administrator' permissions to use this command.");
    }

    const channelId = message.channel.id;

    if (allowedChannels.includes(channelId))
      allowedChannels = allowedChannels.filter(id => id !== channelId);
      message.channel.send(`${message.channel} is now disabled for message posting.`);
    } else {
      allowedChannels.push(channelId);
      message.channel.send(`${message.channel} is now enabled for message posting.`);
    }
    saveAllowedChannels();
  }
    
  else if (command === 'postnow') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You need 'Administrator' permissions to use this command.");
    }

    const targetChannelId = args[0] || message.channel.id;
    await sendPostNow(targetChannelId);
  }
});

async function sendPostNow(channelId) {
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const subreddit = getRandomSubreddit();
  const postType = getRandomPostType();
  const imagePosts = await getImagePosts(subreddit, postType, POSTS_LIMIT);

  const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
  const embed = new EmbedBuilder()
    .setTitle(randomPost.title)
    .setURL(randomPost.permalink)
    .setImage(randomPost.imageUrl)
    .setFooter({ text: `Posted by u/${randomPost.author} on r/${subreddit}` })
    .setColor(0xff69b4);

  await channel.send({ embeds: [embed] }).catch(console.error);
}

client.login(BOT_TOKEN);
