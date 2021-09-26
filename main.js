/*
Esto es un bot de música, en retaliación a Youtube por cerrar los principales bots de música, 
así que me dije a mi mismo ¿Por qué no mejor hago mi propio bot de música? que se jodan las corporaciones 🤙
Autor: Limo, 2021
Librerias usadas:
Discord.js@12.4.1
discordjs/opus 0.5.3
ffmpeg-static 4.4.0
yt-search 2.10.1
ytdl-core 4.9.1
fs 0.0.1-security
dotenv 10.0.0
ytpl 2.2.3
*/
//Dependencias
const Discord = require('discord.js');
require('dotenv').config();

//Se necesita hacer esto para "crear" el bot
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ]});

//Las colleciones donde almacenaremos los comandos y eventos
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>
    {
    require(`./handlers/${handler}`)(client, Discord);
    })

//Login al bot
client.login(process.env.DISCORD_TOKEN);