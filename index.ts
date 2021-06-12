import * as discord from 'discord.js'
import buttons from 'discord-buttons'
import dotenv from 'dotenv'
import mongo from 'mongodb'
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

client.on('message', async message => {
	
	switch (message.content.toLowerCase()) {
		case '&snek':
			// @ts-expect-error
			let snekButton = new buttons.MessageButton().setLabel("Delete").setStyle("red").setID('snek_button')
			message.channel.send('Pizza', snekButton);
		break
		case '&clik':
			// @ts-expect-error
			message.channel.send('money' ,new buttons.MessageButton().setLabel("Click if ur kewl").setStyle("blurple").setID('clik_button'));
		break
		case '&coinz':
			userdata.findOne({_id: message.member?.id}).then((data: userdata) => {
				message.reply("you have " + data.coins + " coins.")
			})
		break
	}
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

