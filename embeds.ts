import * as discord from 'discord.js'

function clickerEmbed(): discord.MessageEmbed {
	const embed = new discord.MessageEmbed()
	.setColor('#2F3136')
	.setTitle('Clicker Game')
	.addFields(
		{ name: '\u200B', value: 'Click the "Click" Button to start' },
		{ name: '&upgrades', value: ' Upgrade Your Clicks', inline: true},
		{ name: '&coins', value: 'see your coins', inline: true},
	)
	.setFooter('\u200B');


	return embed
}

function snakeEmbed(snakegame: string, score: number): discord.MessageEmbed {
	const embed = new discord.MessageEmbed()
	.setColor('#2F3136')
	.setTitle('Public Snake Game')
	.setDescription(snakegame)
	.addFields(
		{ name: 'Score:', value: score.toString()}
	)
	.setFooter('\u200B');


	return embed
}

module.exports = {
	clickerEmbed,
	snakeEmbed
}