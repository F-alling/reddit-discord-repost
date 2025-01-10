# reddit-discord-repost
Automatically reposts images from set subreddits on a set interval.

# How to use
Before you start you are going to need the following
- Node.js installed
- A discord bot with permissions to delete messages
- A reddit bot

## Setup
1: Clone or download the repo
- Use git to clone the repo
- Click "Code" then download zip.

2: Install dependencies
- This can be done by running `npm install` in a terminal

3: Put your tokens in .env
- Your discord bot token
- Your reddit client id
- Your reddit client secret
- Your reddit user agent
- Reddit oAuth token.

4: Setup your subreddits
- Replace subreddit1, subreddit2, and subreddit3 with the subreddits you want (excluding the r/)

5: Start the bot
- This can be done by running `node index.js` in a terminal

6: Allow automatic posting
- You will need to run !post in the channel(s) you want the bot to be active in
- You will NEED admin permissions to prevent anyone from doing this
- You can manually add channels to channels.json if needed

## Q/A
Q:I dont have a bot token! 
A: You can create a discord guide with the guide [here.](https://discordpy.readthedocs.io/en/stable/discord.html)

Q: I dont have a reddit bot!
A: You can create one here.

Q: What is my reddit bot client id?
A: Your bot client id should be under your reddit bot username

Q: What is my reddit bot secret?
A: Your bot secret should be in the same area as your client id

Q: I dont have the base64 of my bot!
A: Use a base64 encoder site to encode the following exactly:
`reddit_bot_client_id`:`reddit_bot_client_secret`
-# make sure to include the : between them.

Q: The bot says some random giberish when I try to get posts

A: Youve most likely been blocked by reddit. This could be due to multiple reasons, for instance using a vpn or vps. Make sure your bot info is correctly inputed. If its still not working submit a support request to reddit under "I am a developer", and fill it out with the appropriate information.
