import 'dotenv/config';

const WS_AND_W_SERVER_HOST = process.env.host?? 'localhost';
export const settings = {
    ssh: {
        host: process.env.sshHost,
        port: parseInt(process.env.sshPort ?? '22'),
        username: process.env.sshUsername,
        password: process.env.sshPassword
    },
    webServer: {
        host: WS_AND_W_SERVER_HOST,
        port: parseInt(process.env.ServerPort ?? '3000') ,
    },
    wsServer: {
        host: WS_AND_W_SERVER_HOST,
        port: parseInt(process.env.WSServerPort ?? '3001'),
    },
    privateKey: process.env.privateKey,
    passphrase: process.env.passphrase
};


console.log('Settings', settings)
