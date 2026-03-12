let colorBackgroundUser = [
  'rgb(165, 147, 182)',
  'rgb(108, 76, 110)',
  'rgb(223, 91, 104)',
  'rgb(248, 239, 139)',
  'rgb(111, 41, 210)',
];

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function availableBackground(arrayUser) {
  let available = colorBackgroundUser.filter((back) => {
    return !arrayUser.some((user) => user.background == back);
  });

  return available.length > 0 ? available[0] : getRandomColor();
}

export function generateName() {
  const adjectives = [
    'Happy',
    'Fast',
    'Strong',
    'Clever',
    'Brave',
    'Calm',
    'Bright',
    'Quick',
    'Kind',
    'Bold',
  ];

  const nouns = [
    'Tiger',
    'Wolf',
    'Fox',
    'Lion',
    'Eagle',
    'Bear',
    'Hawk',
    'Panda',
    'Falcon',
    'Rhino',
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  // Generar un número aleatorio entre 0 y 999
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}${noun}${number}`;
}
