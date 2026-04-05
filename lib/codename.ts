const adjectives = [
  'swift', 'bold', 'silent', 'cunning', 'nimble', 'sleek', 'smooth',
  'daring', 'crafty', 'slick', 'wily', 'sharp', 'stealthy', 'quick',
  'rogue', 'elusive', 'covert', 'subtle', 'clever', 'sly',
]

const animals = [
  'fox', 'raven', 'cobra', 'wolf', 'viper', 'lynx', 'hawk', 'puma',
  'jaguar', 'panther', 'falcon', 'mink', 'ferret', 'weasel', 'badger',
  'otter', 'stoat', 'marten', 'civet', 'genet',
]

const roles = [
  'vault', 'ghost', 'cipher', 'runner', 'wraith', 'specter', 'fixer',
  'broker', 'courier', 'alias', 'contact', 'fence', 'mole', 'operative',
  'shadow', 'cleaner', 'handler', 'trigger', 'lookout', 'grifter',
]

function pick(list: string[]): string {
  if (list.length === 0) return 'X'
  return list[Math.floor(Math.random() * list.length)]
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function generateCodename(): string {
  return capitalize(pick(adjectives)) + capitalize(pick(animals)) + capitalize(pick(roles))
}
