import * as discord from 'discord.js' // For interacting with discord
import * as buttons from 'discord-buttons' // For something that's not discord buttons
import dotenv from 'dotenv' // For loading .env files.
import mongo from 'mongodb' //Interacting with the mongoDB database
import * as embed from './embeds'
import * as snake from './snake'
import * as sn8 from './interface'
dotenv.config()

// all of this was made by sbeve

const client = new discord.Client()
buttons.default(client)

client.on('ready', () => {
	console.log("Holy smokes the bot is ready!")
})
let database: any;
let userdata: any;
let guilddata: any;

// Oh it's deprecated? WHY NOT UPDATE YOUR DOCS TO GIVE BETTER INSTRUCTIONS THEN HUH
mongo.MongoClient.connect(process.env.dbURL as string, (err, dbClient) => {
	if (!err) {
		console.log("Connected to the mongoDB database!")
		database = dbClient.db('sn8')
		userdata = database.collection("userdata")
		guilddata = database.collection("guilddata")
	}
	else {
		console.error(err)
		process.exit(1)
	}
})



client.on('message', async message => {

	if (!message.guild) return

	guilddata.findOne({_id: message.guild.id}).then(async (data: sn8.guilddata) => {

		if (!data) {
			//Create one..
			await guilddata.insertOne({_id: message.guild!.id, prefix: "&"})
			data = {
				prefix: '&'
			}
		}

		if (message.content.startsWith(data.prefix)) {
			let command: string;
			let args: Array<string>;

			if (message.content.includes(" ")) {
				command = message.content.substring(data.prefix.length, message.content.indexOf(" "))
				args = message.content.substring(command.length + data.prefix.length + 1).split(" ")
			}
			else {
				command = message.content.substring(data.prefix.length)
				args = []
			}
	
			switch (command) {
				case 'snake':
					snake.startSnek(message.channel as discord.TextChannel)
				break
				case 'clicker':
					
					message.channel.send({
						// @ts-expect-error
						component: new buttons.MessageButton().setLabel("Click").setStyle("green").setID('clik_button'),
						// @ts-expect-error
						embed: embed.clickerEmbed()
					});
				break
				case 'coin':
					userdata.findOne({_id: message.member?.id}).then((data: sn8.userdata) => {
						if (!data) {message.reply("you don't have any coins.")}
						else message.reply("you have " + data.coins + " coins.")
					})
				break
				case 'coins':
					userdata.findOne({_id: message.member?.id}).then((data: sn8.userdata) => {
						if (!data) {message.reply("you don't have any coins.")}
						else message.reply("you have " + data.coins + " coins.")
					})
				break
				case 'options':
					switch (args[0]) {
						case 'prefix':
							if (args[1]) {
								guilddata.updateOne({_id: message.guild!.id}, {$set: {prefix: args[1]}}).then(() => {
									message.channel.send("The prefix has been successfully changed to " + args[1])
								}).catch((err: any) => {
									message.reply("sorry but I could not update our internal database because " + err)
								})
							}
							else {
								message.reply("you need to provide a new prefix.")
							}
						break
						default:
							message.reply("no such option could be found.")
						break
					}
				break
			}
		}
	})
})

client.on('clickButton', async (button) => {
	if (!button.deffered || !button.replied) {
		switch (button.id) {
			case "clik_button":
				await button.clicker.fetch()
				let user = await userdata.findOne({_id: button.clicker.user.id})
				if (user) {
					await userdata.updateOne({_id: button.clicker.user.id}, { $set: {coins: user.coins + 1}})
				} else {
					await userdata.insertOne({_id: button.clicker.user.id, coins: 1})
				}
				await button.defer()
			break;
			case 'snek_button_up':
				snake.sneks.forEach(game => {
					if (game.channel = button.channel) game.direction = "up"
				});
				await button.defer()
			break;

			case 'snek_button_down':
				snake.sneks.forEach(game => {
					if (game.channel = button.channel) game.direction = "down"
				});
				await button.defer()
			break;
			case 'snek_button_right':
				snake.sneks.forEach(game => {
					if (game.channel = button.channel) game.direction = "right"
				});
				await button.defer()
			break;

			case 'snek_button_left':
				snake.sneks.forEach(game => {
					if (game.channel = button.channel) game.direction = "left"
				});
				await button.defer()
			break;
		}
	}
});

client.login(process.env.botToken)