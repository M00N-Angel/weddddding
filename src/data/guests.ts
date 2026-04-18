export type GuestFlag = 'two' | 'one' | 'male'

export interface Guest {
  id: string
  name: string
  flag: GuestFlag
}

const guests: Guest[] = [
  	{ id: 'er2', name: 'Олег и Влада', flag: 'two' },
	{ id: 'pe7', name: 'Мама и папа', flag: 'two' },
	{ id: 'iv2', name: 'Мама и папа', flag: 'two' },
	{ id: 'yu6', name: 'Алёна и Алексей', flag: 'two' },
	{ id: 'yi7', name: 'Валерия и Руслан', flag: 'two' },
	{ id: 'ws2', name: 'Екатерина и Даниил', flag: 'two' },
	{ id: 'rf2', name: 'Евгений и Валерия', flag: 'two' },
	{ id: 'yh3', name: 'Станислав и Виктория', flag: 'two' },
	{ id: 'wb2', name: 'Анна и Артур', flag: 'two' },
	{ id: 'po2', name: 'Наталья и Александр', flag: 'two' },
	{ id: 'mp2', name: 'Даниил и Татьяна', flag: 'two' },
	{ id: 'lp2', name: 'Ромка', flag: 'male' },
	{ id: 've2', name: 'Анжела и Антон', flag: 'two' },
	{ id: 'zw2', name: 'Анастасия и Александр', flag: 'two' },
	{ id: 'cv2', name: 'Иван и Полина', flag: 'two' },
	{ id: 'ky2', name: 'Екатерина и Александр', flag: 'two' },
	{ id: 'qa2', name: 'Екатерина', flag: 'one' },
	{ id: 'ed2', name: 'Александра', flag: 'one' },
	{ id: 'tg1', name: 'Анюта', flag: 'one' },
	{ id: 'fv2', name: 'Оксана и Игорь', flag: 'two' },
	{ id: 'nm2', name: 'Вита', flag: 'one' },
	{ id: 'mj2', name: 'Арина и Александр', flag: 'two' },
	{ id: 'mo8', name: 'Арина', flag: 'one' },
	{ id: 'pr2', name: 'Дарина', flag: 'one' },
	{ id: 'sh7', name: 'Павел', flag: 'male' },
	{ id: 'uv2', name: 'Павел', flag: 'male' },
	{ id: 'hg2', name: 'Дмитрий', flag: 'male' },
	{ id: 'sm2', name: 'Владислав', flag: 'male' },
]

export default guests
