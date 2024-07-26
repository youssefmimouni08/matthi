<script lang="ts">
	import type { Message, Question } from '../../../../../ambient';
	import { onMount } from 'svelte';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import { getApplicationStore } from '$lib/stores/application.store';
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';
	import { IconsEnum } from '$lib/constants';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();

	const questionFactory = questionBuilder();
	let isEdit: boolean = false;
	let isMarkAnswer: boolean = false;
	let isCheck: boolean = false;
	let disabled = false;
	
	const applicationStore = getApplicationStore();
	let isSubmitted = $applicationStore.isSubmitted;

	$: isMarkAnswer = message.isAnswer ?? false;
	$: question = !!message.for
		? $questionsStore.find((x) => x.id == message.for) ?? ({} as Question)
		: ({} as Question);

	const setAnswer = () => {
		if (isCheck) {
			questionFactory.setUserAnswer(question.id, isCheck);
			questionFactory.markAnswer(question.id, message.id, message.display);
			useMessagesStore().markAnswer(question.id, message.id, message.display);
			questionFactory.setQuestionSuccess(question.id);
			applicationStore.update((x) => Object.assign(x, { isSubmitted: true }));
			isMarkAnswer = true;
			isEdit = false;
			disabled = true;
			isSubmitted = true;
		}
	};

	let animatedText = '';
	let isFinishTyping = false;
	onMount(() => {
		console.log('questions', question);
		console.log('message', message);
		const displayWords = message.display.split(' ');
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
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm text-on-primary p-4 msg gap-4"
	data-expand-text={!!message.is_expand_text ?? false}
>
	<div
		class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap gap-4 pl-12"
	>
		<div class="w-full flex flex-row flex-nowrap justify-start items-start gap-x-2">
			<input
				type="checkbox"
				id="chat-checkbox-promotional"
				bind:checked={isCheck}
				class="w-6 aspect-square accent-surface-5 disabled:opacity-30 action-btn"
				on:change={setAnswer}
				data-answer={isMarkAnswer}
				{disabled}
			/>
			<label class="w-full text-left" for="chat-checkbox-promotional">{animatedText}</label>
		</div>
		{#if isSubmitted}
			<div
				class="btn-icon w-max self-end text-xl text-primary bg-surface-5 rounded-full p-1 flex justify-center items-center"
				aria-label="The form has been submitted"
				
			>
				<Icon icon={IconsEnum.CHECK}></Icon>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	[data-answer='true'] {
		@apply accent-surface-8;
	}
</style>
