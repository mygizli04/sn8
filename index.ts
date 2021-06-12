import * as discord from 'discord.js' // For interacting with discord
import buttons from 'discord-buttons' // For something that's not discord buttons
import dotenv from 'dotenv' // For loading .env files.
import mongo from 'mongodb' //Interacting with the mongoDB database
dotenv.config()

const client = new discord.Client()
buttons(client)

client.on('ready', () => {
	console.log("Holy smokes the bot is ready!")
})
let database: any;
let userdata: any;
let guilddata: any;

const db = mongo.MongoClient.connect(process.env.dbURL as string, (err, dbClient) => {
	if (!err) {
		console.log("Connected to the mongoDB database!")
		database = dbClient.db('sn8')
		userdata = database.collection("userdata")
		guilddata = database.collection("guilddata")
	}
	else {
		console.error("Could not conenct to the database!")
		process.exit(1)
	}
})

interface userdata {
	coins: number
}

interface guilddata {
	prefix: string
}

client.on('message', async message => {

	if (!message.guild) return

	guilddata.findOne({_id: message.guild.id}).then(async (data: guilddata) => {

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
				case 'snek':
					// @ts-expect-error
					let snekButton = new buttons.MessageButton().setLabel("Delete").setStyle("red").setID('snek_button')
					message.channel.send('Pizza', snekButton);
				break
				case 'clik':
					// @ts-expect-error
					message.channel.send('__**Click to Earn Money**__ \n > do &coinz to check your coinz \n > do &upgradez to upgrade your click amount \n.' ,new buttons.MessageButton().setLabel("Click").setStyle("blurple").setID('clik_button'));
				break
				case 'coinz':
					userdata.findOne({_id: message.member?.id}).then((data: userdata) => {
						message.reply("you have " + data.coins + " coinz.")
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
			case 'snek_button':
				button.message.delete()
			break
		}
	}
});

client.login(process.env.botToken)

