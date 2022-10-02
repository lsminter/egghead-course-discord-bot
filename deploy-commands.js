import { SlashCommandBuilder, Routes, PermissionFlagsBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import dotenv from 'dotenv'
dotenv.config()

const commands = [
  new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),
	new SlashCommandBuilder()
		.setName('newbookclub')
		.setDescription('Replies with the first person from the star wars api'),
	new SlashCommandBuilder()
		.setName('deletechannel')
		.setDescription('Deletes the channel that the command is used in')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
]

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);