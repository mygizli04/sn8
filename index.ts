import * as discord from 'discord.js'
import buttons from 'discord-buttons'
import dotenv from 'dotenv'
dotenv.config()

const client = new discord.Client()
buttons(client)

client.on('ready', () => {
	console.log("Holy smokes the bot is ready!")
})

client.on('message', message => {
	
	switch (message.content.toLowerCase()) {
		case '&snek':
			let snekButton = new buttons.MessageButton().setLabel("Delete").setStyle("red").setID('snek_button') // NO error
			// @ts-expect-error
			message.channel.send('Pizza', snekButton);
		break
		case '&clik':
			let messageClick = new buttons.MessageButton().setLabel(" ").setStyle("blurple").setID('clik_button') // NO error
			// @ts-expect-error
			message.channel.send('Click to money', messageClick);
		break
	}
})

client.on('clickButton', async (button) => {
	if (!button.deffered || !button.replied) {
		switch (button.id) {
			case "clik_button":
                console.log(button.member)
				await button.defer()
			break;
			case 'snek_button':
				button.message.delete()
			break
		}
	}
});

client.login(process.env.botToken)

