import { Client, GatewayIntentBits, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import moment from 'moment';

import dotenv from 'dotenv'
dotenv.config()

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.DirectMessages,
	], 
	partials: ['CHANNEL'] });

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping'){
		await interaction.reply('Pong!')
	}
	else if (commandName === 'newbookclub') {

		const userFilter = (user) => {
			return user.id === interaction.user.id
		}
		
		await interaction.reply({content: 'What book are you going to go through?'})

		const userBookReply = await interaction.channel.awaitMessages({ userFilter, max: 1, time: 10000})
		const book = userBookReply.first().content + ' Book Club ' + moment().format('MMMM Do YYYY')

		const author = userBookReply.first().author.username

		await interaction.followUp({content: 'How many people are you wanting for the book club?'})
		const userNumberOfPeopleReply = await interaction.channel.awaitMessages({ userFilter, max: 1, time: 10000})
		const numberOfPeople = userNumberOfPeopleReply.first().content

		const customButton = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setStyle(ButtonStyle.Primary)
					.setEmoji('👍')
			);

		const embedBookClubMessage = {
			title: book,
			description: `${author} is going to run a book club on the book ${book}.`,
			fields: [
				{
					name: 'Amount of people wanted',
					value: `${numberOfPeople}`
				},
				{
					name: 'Link on Wikipedia',
					value: `https://en.wikipedia.org/wiki/${userBookReply}`
				}
			]
		}

		const botEmbedMessage = await interaction.followUp({ embeds: [embedBookClubMessage], components: [customButton]})

		interaction.guild.roles.create({ 
			name: `${book}`,
			permissions: [PermissionsBitField.Flags.SendMessages]
		})		

		const bookClubChannel = await interaction.guild.channels.create({ 
			name: `${book}`,
			type: ChannelType.GuildText,
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: [PermissionsBitField.Flags.ViewChannel]
				}
			]
		})

		bookClubChannel.permissionOverwrites.create(interaction.guild.roles.cache.find(r => r.name === book).id, {ViewChannel: true})

		const filter = i => i.customId === 'primary'

		const collector = interaction.channel.createMessageComponentCollector({ filter, max: numberOfPeople, time: 20000});

		collector.on("collect", i => {
			const bookClubRole = interaction.guild.roles.cache.find(r => r.name === book)
			const userById = interaction.guild.members.cache.get(i.user.id)

			userById.roles.add(bookClubRole.id)

			i.reply({content: `${i.user.username} has been added to the book club!`})
			console.log(`Collected ${customButton.components[0].data.emoji.name} from ${i.user.username}`)
		})

		collector.on("end", collected => {
			console.log(`Collected ${collected.size} out of ${numberOfPeople}`)
		})
	}

	
	else if (commandName === 'deletechannel') {

		const userFilter = (user) => {
			return user.id === interaction.user.id
		}
		const userById = interaction.guild.members.cache.get(interaction.user.id)

		console.log(userById.roles)

		await interaction.reply({content: 'What channel are you wanting to delete? Make sure to type the channel name exactly as it is spelled.'})

		const interactionReply = await interaction.channel.awaitMessages({ userFilter, max: 1, time: 10000})

		const channelToBeDeleted = interactionReply.first().content

		await interaction.followUp({content: `Are you sure you want to delete the channel: ${channelToBeDeleted}?`})

		const deleteChannelFollowup = await interaction.channel.awaitMessages({ userFilter, max: 1, time: 10000})

		const followupMessage = deleteChannelFollowup.first().content

		const fetchedChannel = client.channels.cache.find(channel => channel.name === channelToBeDeleted)
		const fetchedRole = interaction.guild.roles.cache.find(r => r.name === channelToBeDeleted)

		if (followupMessage === 'yes') {
			fetchedChannel.delete('Book Club Finished')
		} else {
			return
		}
	}
});

client.login(process.env.BOT_TOKEN);