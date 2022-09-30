import { Client, GatewayIntentBits } from "discord.js"
import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
    const embedEvent = {
      color: 0x0099ff,
      title: "Pong!",
      description: `Pong!`,
			fields: [
				{
					name: 'Ping Pong Table',
					value: 'Ping Pong Table'
				}
			]
    }

		const botMessage = await interaction.reply({embeds: [embedEvent]})
    
	} 
});

client.login(process.env.BOT_TOKEN);