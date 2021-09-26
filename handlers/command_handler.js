//Dependencias
const fs = require('fs');

//Proceso
module.exports = (client, Discord) =>
{
    //Para agarrar unicamente archivos .js
    const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    for(const file of command_files)
    {
        //Verificar el comando
        const command = require(`../commands/${file}`);
        if(command.name)
        {
            client.commands.set(command.name, command);
        }
        else
        {
            continue;
        }
    }
}