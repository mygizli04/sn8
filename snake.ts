import * as sn8 from './interface'
import * as utils from './utils'
import * as discord from 'discord.js'
import * as buttons from 'discord-buttons'

export let sneks: Array<sn8.snek> = []

let snakebuttons = new buttons.MessageActionRow().addComponent(
	// @ts-expect-error
		new buttons.MessageButton().setLabel("↑").setStyle("blurple").setID('snek_button_up')).addComponent(
	// @ts-expect-error
		new buttons.MessageButton().setLabel("↓").setStyle("blurple").setID('snek_button_down')).addComponent(
	// @ts-expect-error
		new buttons.MessageButton().setLabel("←").setStyle("blurple").setID('snek_button_left')).addComponent(
	// @ts-expect-error
		new buttons.MessageButton().setLabel("→").setStyle("blurple").setID('snek_button_right'))

export async function startSnek(channel: discord.TextChannel) {
	let message = await channel.send({
		// @ts-expect-error
		component: snakebuttons,
		// @ts-expect-error
		embed: embed.snakeEmbed("Please Wait...", 0)
	})

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
			snekdata: [ [ 0 ]],
			fruitpos: {x: 4, y: 4}
		}

	})
}







setInterval(() => tickSneks(), 2000)

function tickSneks() {
	sneks.forEach((snek: sn8.snek) => {
		//Render the snek
		let newhead: sn8.Vector2 = {x:0, y:0};
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
				newhead.y = snek.gameState.sneknodes[0].y - 1
				break
			case 'down':
				newhead.x = snek.gameState.sneknodes[0].x
				newhead.y = snek.gameState.sneknodes[0].y + 1
				break
		}
		if (newhead.x == snek.gameState.fruitpos.x && newhead.y == snek.gameState.fruitpos.y){
			snek.gameState.sneknodes.unshift(newhead) 
			snek.gameState.fruitpos = {
				x: utils.getRandomInt(9),
				y: utils.getRandomInt(9)
			}
			while (snek.gameState.snekdata[snek.gameState.fruitpos.y][snek.gameState.fruitpos.x] != 0) {
				snek.gameState.fruitpos = {
					x: utils.getRandomInt(9),
					y: utils.getRandomInt(9)
				}				
			}
			snek.gameState.sneksize += 1
		} else {
			snek.gameState.sneknodes.unshift(newhead) 
			snek.gameState.sneknodes.pop();
		}


		if (snek.gameState.sneknodes[0].x > 9 || snek.gameState.sneknodes[0].x < 0) {
			const index = sneks.indexOf(snek);
			if (index > -1) {
				sneks.splice(index, 1);
			}
			snek.message.edit({
				// @ts-expect-error
				embed: embed.snakeEmbed("You Have Lost!", snek.gameState.sneksize)
			})
			return
		}
		if (snek.gameState.sneknodes[0].y > 9 || snek.gameState.sneknodes[0].y < 0) {
			const index = sneks.indexOf(snek);
			if (index > -1) {
				sneks.splice(index, 1);
			}
			snek.message.edit({
				// @ts-expect-error
				embed: embed.snakeEmbed("You Have Lost!", snek.gameState.sneksize)
			})
			return
		}
		let num = 1;
		let ret2 = false
		snek.gameState.sneknodes.forEach((node: sn8.Vector2) => {
			if (num != 1) {
			if (newhead.x == node.x && newhead.y == node.y) {
				const index = sneks.indexOf(snek);
				if (index > -1) {
					sneks.splice(index, 1);
				}
				ret2 = true
				snek.message.edit({
					// @ts-expect-error
					embed: embed.snakeEmbed("You Have Lost!", snek.gameState.sneksize)
				})
				return;
			}}
			num++;
		})
		if (ret2) return


		
		snek.message.edit({
			// @ts-expect-error
			component: snakebuttons,
			// @ts-expect-error
			embed: embed.snakeEmbed(renderSnek(snek), snek.gameState.sneksize)
		})
	})
}


function renderSnek(snek: sn8.snek) {
	let msg = ""
	let state = utils.makeVector(10,10);
	state[snek.gameState.fruitpos.y][snek.gameState.fruitpos.x] = 2
	
	snek.gameState.sneknodes.forEach((point: sn8.Vector2) => {
		state[point.y][point.x] = 1
	});
	state[snek.gameState.sneknodes[0].y][snek.gameState.sneknodes[0].x] = 3
	snek.gameState.snekdata = state
	
	state.forEach(y => {
		y.forEach(x => {
			switch (x) {
				case 0:
					msg += ":black_large_square:"
				break
				case 1:
					msg += ":yellow_square:"
				break
				case 2:
					msg += ":apple:"
				break;
				case 3:
					msg += ":red_square:"
					break;
				default:
					debugger
			}			
		});
		msg += "\n"

	})
	return msg
}