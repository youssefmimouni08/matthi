<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message, Question } from '../../../../../ambient';
	import { onMount, tick } from 'svelte';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import SvelteMarkdown from 'svelte-markdown';
	import Link from '../Markdown/Link.svelte';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();

	const questionFactory = questionBuilder();
	let isEdit: boolean = false;
	let textEditor: HTMLTextAreaElement;
	let isMarkAnswer: boolean = false;
	let isSuggested: boolean = false;

	let answer = message.message_object.display ?? '';
	$: isMarkAnswer = message.message_object.is_answer ?? false;
	$: isSuggested = message.message_object.is_suggested ?? false;
	$: question = !!message.message_object.question_id
		? $questionsStore.find((x) => x.id == message.message_object.question_id) ?? ({} as Question)
		: ({} as Question);

	const setEdit = async (edit: boolean) => {
		isEdit = edit;
		answer = message.message_object.display;
		if (edit) {
			await tick();
			if (textEditor) textEditor.focus();
		}
	};

	const setAnswer = () => {
		// questionFactory.setUserAnswer(question.id, answer);
		// questionFactory.markAnswer(question.id, message.id, answer);
		// useMessagesStore().markAnswer(question.id, message.id, answer);
		// questionFactory.setQuestionSuccess(question.id);
		isMarkAnswer = true;
		isEdit = false;
	};

	const removeAnswer = () => {
		// questionFactory.setUserAnswer(question.id, '');
		// questionFactory.removeAnswer(question.id, message.id, answer);
		// useMessagesStore().removeAnswer(question.id, message.id, answer);
		// questionFactory.setQuestionUnsuccess(question.id);
		isMarkAnswer = true;
		isEdit = false;
	};

	let animatedText = '';
	let isFinishTyping = false;
	onMount(() => {
		const displayWords = message.message_object.display.split(' ');
		let wId = 0;
		let INTERVAL_TIME = 50;
		const interVals = setInterval(() => {
			if (wId >= displayWords.length) return;
			animatedText += displayWords[wId] + ' ';
			wId++;
		}, INTERVAL_TIME);
		setTimeout(
			() => {
				clearInterval(interVals);
				isFinishTyping = true;
			},
			INTERVAL_TIME * (displayWords.length + 1)
		);
	});
</script>

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm p-4 pb-0 msg gap-4 text-on-primary"
	data-ai-suggestion={isSuggested}
>
	<div
		class="w-12 aspect-square rounded-full text-surface-8 flex justify-center items-center p-1 ai-icon"
	>
		<Icon icon={IconsEnum.ROBOT} class="text-3xl"></Icon>
	</div>

	<div class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap">
		{#if isEdit}
			<textarea
				name="adjust-answer"
				bind:value={answer}
				class="w-full h-[min(150px,30vh)] flex flex-col flex-nowrap p-4 bg-transparent rounded-xl rounded-bl-none whitespace-pre-wrap resize-none overflow-x-hidden overflow-y-auto scroll-bar"
				bind:this={textEditor}
			></textarea>
		{:else}
			<div class="w-full text-left relative">
				<div class="w-full text-left markdown {isFinishTyping ? 'opacity-100' : 'opacity-0'}">
					<SvelteMarkdown source={message.message_object.display} renderers={{ link: Link }}></SvelteMarkdown>
				</div>
				{#if !isFinishTyping}
					<div class="w-full text-left markdown opacity-100 absolute top-0 left-0">
						<SvelteMarkdown source={animatedText} renderers={{ link: Link }}></SvelteMarkdown>
					</div>
				{/if}
			</div>
		{/if}
		<div class="w-full flex flex-row flex-nowrap justify-end items-stretch gap-4 py-1">
			{#if isSuggested && isFinishTyping}
				<div class="flex flex-row flex-nowrap flex-1">
					<div
						class=" gap-2 bg-yellow-500 text-black font-semibold rounded-full px-2 py-1 text-xs flex flex-row justify-center flex-nowrap"
					>
						<span>AI Suggestion</span>
					</div>
				</div>
				{#if isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Cancel My Changes"
						on:click={() => {
							setEdit(false);
						}}
					>
						<Icon icon={IconsEnum.CANCEL_CHANGE}></Icon>
					</button>
				{:else}
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Edit"
						on:click={() => {
							setEdit(true);
						}}
					>
						<Icon icon={IconsEnum.EDIT}></Icon>
					</button>
				{/if}
				{#if isMarkAnswer && isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={setAnswer}
						aria-label="Save My Changes"
					>
						<Icon icon={IconsEnum.SAVE}></Icon>
					</button>
				{/if}
				{#if isMarkAnswer}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={removeAnswer}
						aria-label="Remove My Answers"
					>
						<Icon icon={IconsEnum.MARK_OFF}></Icon>
					</button>
					<div
						class="btn-icon action-btn text-xl text-primary bg-surface-5 rounded-full p-1 flex justify-center items-center"
						aria-label="Your Answer"
					>
						<Icon icon={IconsEnum.CHECK}></Icon>
					</div>
				{:else}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={setAnswer}
						aria-label="Mark My Answer"
					>
						<Icon icon={IconsEnum.MARK_ON}></Icon>
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	[data-expand-text='true'] .ai-icon {
		@apply opacity-0;
	}
</style>
