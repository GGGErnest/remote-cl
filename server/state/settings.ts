import 'dotenv/config';

const WS_AND_W_SERVER_HOST = process.env.host?? 'localhost';

export const settings = {
    webServer: {
        host: WS_AND_W_SERVER_HOST,
        port: parseInt(process.env.ServerPort ?? '3000') ,
    },
    wsServer: {
        host: WS_AND_W_SERVER_HOST,
        port: parseInt(process.env.WSServerPort ?? '3001'),
    }
};
