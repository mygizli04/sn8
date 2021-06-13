import * as discord from 'discord.js'


export interface Vector2 {
	x: number, y: number
}

export interface snek {
	message: discord.Message,
	channel: discord.TextChannel,
	direction: 'up' | 'down' | 'left' | 'right',
	gameState: {
		sneknodes: Array<Vector2>,
		snekdata: Array<Array<number>>,
		fruitpos: Vector2,
		sneksize: number,
	}
}

export interface userdata {
	coins: number
}

export interface guilddata {
	prefix: string
}


