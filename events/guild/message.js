//Para verificar que todo lo que ingresa el usuario esté correcto y que el bot no use sus comandos el mismo
module.exports = (Discord, client, message) => 
{
    //Prefijo del bot
    const prefix = '/';
    
    //Aquí empieza la verificación
    if(!message.content.startsWith(prefix) || message.author.bot)
    {
        return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    try
    {
        command.execute(message, args, cmd, client, Discord);
    }
    catch (err)
    {
        const embed = new Discord.MessageEmbed()
        .setColor('#00611a')
        .setTitle('Error 001')
        .setDescription('Ha ocurrido un error desconocido al ejecutar el comando.')
        .setFooter('Para mas informacion sobre comandos usar /help')
        message.reply(embed);
        console.log(err);
    }
}