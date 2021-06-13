export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
  }


export function makeVector(x: number, y:number): Array<Array<number>> {
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