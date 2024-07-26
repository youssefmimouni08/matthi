<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Message, Question } from '../../../ambient';
	import ChatInput from './Chat/ChatInput.svelte';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import type { Writable } from 'svelte/store';
	import { getMessageStore, useMessagesStore } from '$lib/stores/messages.store';
	import ChatMessage from './Chat/ChatMessages/Message.svelte';
	import { browser } from '$app/environment';
	import { getCurrentQuestion } from '$lib/stores/currentQuestion.store';
	import BotMessage from './Chat/ChatMessages/BotMessage.svelte';

	const messageStore = getMessageStore();
	const questionsStore: Writable<Array<Question>> = getQuestionsStore();
	const currentQuestion = getCurrentQuestion();

	export let scrollToBottom = () => {};
	let questions: Array<Question> = [];
	let messagesContainer: HTMLDivElement;
	let questionUnsubscribe = () => {};

	let currActionIndex = 0;

	async function sendMessage(msg: Message) {
		console.log('msg', msg);
		// useMessages.sendMessage(msg);
		const sendMessageResponse = await fetch('/messages', {
			method: 'post',
			body: JSON.stringify({ applicationId: msg.application_id, message: msg })
		}).then((res) => res.json());
		console.log('sendMessageResponse', sendMessageResponse);
		if (browser && !!messagesContainer) {
			await tick();
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	const setCurrentQuestionIndex = (index: string | number | null) => {
		if (!index || index == $currentQuestion) return;
		currentQuestion.update(() => index);
	};

	onMount(() => {
		scrollToBottom = () => {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		};
		questionUnsubscribe = questionsStore.subscribe((value) => {
			if (!value) return;
			questions = [...value];
		});
		return () => {
			questionUnsubscribe();
		};
	});
</script>

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	{#if questions.length > 0}
		<div
			class="w-full flex flex-1 gap-4 flex-col flex-nowrap relative backdrop-blur-lg overflow-hidden scroll-bar"
		>
			<div
				class="w-full flex-1 flex flex-col flex-nowrap justify-start overscroll-y-contain items-start overflow-x-hidden overflow-y-auto scroll-bar pb-32"
				bind:this={messagesContainer}
			>
				{#each $messageStore as msg}
					<div
						class="w-full flex justify-start items-start"
						on:mouseenter={() => setCurrentQuestionIndex(msg.message_object.question_id ?? '')}
						on:touchstart={() => setCurrentQuestionIndex(msg.message_object.question_id ?? '')}
						role="button"
						tabindex="0"
					>
						<ChatMessage message={msg}></ChatMessage>
						<!-- {JSON.stringify(msg.message_object)} -->
					</div>
				{/each}
				<slot></slot>
			</div>
			<div class="w-full flex justify-center flex-col items-center p-2 absolute bottom-2 left-0">
				<ChatInput {sendMessage}></ChatInput>
			</div>
		</div>
	{/if}
</div>
