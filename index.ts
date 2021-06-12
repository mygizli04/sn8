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

// Oh it's deprecated? WHY NOT UPDATE YOUR DOCS TO GIVE BETTER INSTRUCTIONS THEN HUH
mongo.MongoClient.connect(process.env.dbURL as string, (err, dbClient) => {
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
					startSnek(message.channel as discord.TextChannel)
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

interface Vector2 {
	x: number, y: number
}

interface snek {
	message: discord.Message,
	channel: discord.TextChannel,
	direction: 'up' | 'down' | 'left' | 'right',
	gameState: {
		sneknodes: Array<Vector2>,
		snekdata: {head:Vector2, foot:Vector2},
		fruitpos: Vector2,
		sneksize: number,
	}
}

let sneks: Array<snek> = []

async function startSnek(channel: discord.TextChannel) {

	let message = await channel.send("Please wait...")

	let ret = false
	sneks.forEach(snek => {
		if (snek.channel.id === channel.id) {
			message.edit("There's already a snek in this channel!")
			ret = true
		}
	})
	if (ret) return

	sneks.push({
		message: message,
		channel: channel,
		direction: 'right',
		gameState: {
			sneksize: 1,
			sneknodes: [
				{x: 0, y: 0}
			],
			snekdata: {head: {x: 0, y: 0}, foot: {x: 0, y: 0}},
			fruitpos: {x: 4, y: 4}
		}

	})
}

setInterval(() => tickSneks(), 1000)

function tickSneks() {
	sneks.forEach((snek: snek) => {
		//Render the snek

		let newhead: Vector2 = {x:0, y:0};
		switch (snek.direction) { // We probably need to modify this to be the user input rather than the direction it's already facing.
			case 'right':
				newhead.x = snek.gameState.sneknodes[0].x + 1
				newhead.y = snek.gameState.sneknodes[0].y
				break
			case 'left':
				newhead.x = snek.gameState.sneknodes[0].x - 1
				newhead.y = snek.gameState.sneknodes[0].y
				break
			case 'up':
				newhead.x = snek.gameState.sneknodes[0].x 
				newhead.y = snek.gameState.sneknodes[0].y + 1
				break
			case 'down':
				newhead.x = snek.gameState.sneknodes[0].x
				newhead.y = snek.gameState.sneknodes[0].y - 1
				break
		}
		snek.gameState.sneknodes.unshift(newhead)
		snek.gameState.sneknodes.pop();



		snek.message.edit(renderSnek(snek))		
	})
}

function makeVector(x: number, y:number): Array<Array<number>> {
	let ret = []
	for (let i = 0; i < y; i++) {
		let push = []
		for (let p = 0; p < x; p++) {
			push.push(0)
		}
		ret.push(push)
	}
	return ret
}

function renderSnek(snek: snek) {
	let msg = ""
	let state = makeVector(10,10);
	snek.gameState.sneknodes.forEach((point: Vector2) => {
		state[point.y][point.x] = 1
	});
	state.forEach(y => {
		y.forEach(x => {
			switch (x) {
				case 0:
					msg += "⬛"
				break
				case 1:
					msg += "🟨"
				break
				case 2:
					msg += "🍎"
				break
				default:
					debugger
			}			
		});
		msg += "\n"

	})
	return msg
}

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