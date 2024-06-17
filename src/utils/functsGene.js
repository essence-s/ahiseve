let colorBackgroundUser = [
    'rgb(165, 147, 182)',
    'rgb(108, 76, 110)',
    'rgb(223, 91, 104)',
    'rgb(248, 239, 139)',
    'rgb(111, 41, 210)'
]

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
        return !arrayUser.some((user) => user.background == back)
    })

    return available.length > 0 ? available[0] : getRandomColor()

}

//to improve
export function generateName() {
    const caracters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let name = '';

    for (let i = 0; i < 6; i++) {
        const indice = Math.floor(Math.random() * caracters.length);
        name += caracters.charAt(indice);
    }

    return name;
}