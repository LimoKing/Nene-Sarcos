const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

//Queue global para el bot. Cada servidor tendra un key y un value para el map { guild.id, queue_constructor{} }
const queue = new Map();

module.exports = 
{
    name: 'play',
    aliases: ['skip', 'stop', 'p', 'pl', 'pla'],
    cooldown: 0,
    description: 'Advanced music bot',
    async execute(message,args, cmd, client, Discord)
    {

        //Chequeando por el canal de voz y los permisos
        const voice_channel = message.member.voice.channel;
        if (!voice_channel)
        {
            return message.channel.send('Necesitas estar en un canal de voz para usar este comando');
        }
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT'))
        {
            return message.channel.send('No tienes los permisos correctos');
        } 
        if (!permissions.has('SPEAK'))
        {
            return message.channel.send('No tienes los permisos correctos');
        } 

        //Este es el queue para nuestro server. Agarrarmos el queue del servidor del queue global
        const server_queue = queue.get(message.guild.id);

        //Aquí cuando se usa las variantes del comando play
        if (cmd === 'play' || cmd === 'p' || cmd === 'pl' || cmd === 'pla')
        {
            if (!args.length)
            {
                return message.channel.send('Coloca algo para buscar');
            } 
            let song = {};

            //Si el primer argumento es un link. El objeto song tendra dos keys, titulo y URL
            if (ytdl.validateURL(args[0])) 
            {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } 
            else 
            {
                /*
                Si no hay link, usamos las palabras para buscar el vídeo. 
                El objeto song tendrá dos keys. Titulo y URL
                */
                const video_finder = async (query) =>
                {
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video)
                {
                    song = { title: video.title, url: video.url }
                } 
                else 
                {
                     message.channel.send('Error al buscar el vídeo.');
                }
            }

            /* Si el queue del servidor no existe, 
            entonces se crea el constructor para que se añada al queue global
            */
            if (!server_queue)
            {

                const queue_constructor = 
                {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                
                //Agrega nuestra key del value al queue global. Usaremos esto para conseguir el queue del servidor.
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                //Establecemos la connection y darle play a la canción con la función video_player
                try 
                {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } 
                catch (err) 
                {
                    queue.delete(message.guild.id);
                    message.channel.send('Hubo un error conectando');
                    throw err;
                }
            } 
            else
            {
                server_queue.songs.push(song);
                return message.channel.send(`👍 **${song.title}** Ha sido añadido a la playlist`);
            }
        }

        else if(cmd === 'skip')
        {
            skip_song(message, server_queue);
        } 
        else if(cmd === 'stop') 
        {
            stop_song(message, server_queue);
        } 
    }
    
}

const video_player = async (guild, song) => 
{
    const song_queue = queue.get(guild.id);


    //Si no hay canción en el queue del servidor. Sale del voice channel y borra el key y el value del queue global
    if (!song) 
    {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 1 })
    .on('finish', () => 
    {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });
    await song_queue.text_channel.send(`🎶 Se esta reproduciendo: **${song.title}**`)
}

const skip_song = (message, server_queue) => 
{
    if (!message.member.voice.channel)
    {
        return message.channel.send('Necesitas estar en un canal de voz para ejecutar este comando');
    } 
    if(!server_queue)
    {
        return message.channel.send(`No hay canciones en la playlist 😔`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (message, server_queue) => 
{
    if (!message.member.voice.channel) 
    {
        return message.channel.send('Necesitas estar en un canal de voz');
    } 
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}