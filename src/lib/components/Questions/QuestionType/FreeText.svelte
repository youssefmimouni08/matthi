<script lang="ts">
	import type { Question } from '../../../../ambient';
	import { slide } from 'svelte/transition';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import SvelteMarkdown from 'svelte-markdown';
	import Link from '../Chat/Markdown/Link.svelte';
	import Icon from '@iconify/svelte';
	import { IconsEnum } from '$lib/constants';

	export let question: Question = {} as Question;
	const { dispatch } = useBusEvent();

	let answer = '';
	let hasError = false;
	let errorMessages = '';
	let hasAnswer = false;
	let isEditAnswer = false;

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer ?? '';

	const validate = () => {
		hasError = false;
		errorMessages = '';
		if (String(answer).length == 0) {
			errorMessages = 'Your answer is empty';
		}
		hasError = errorMessages.length > 0;
	};

	const saveAnswer = () => {
		validate();
		if (hasError) return;
		// const res = questionBuilder().setUserAnswer(question.id, answer);
		// if (res) {
		// 	question.userAnswer = answer;
		// 	hasAnswer = true;

		// 	const setSuccessRes = questionBuilder().setQuestionSuccess(question.id);
		// 	console.log('setSuccessRes', setSuccessRes);
		// 	if (setSuccessRes) {
		// 		question.isSuccess = true;
		// 	}
		// }
	};

	const setEditAnswer = () => {
		// answer = String(question.userAnswer);
		isEditAnswer = true;
	};

	const cancel = () => {
		// answer = String(question.userAnswer);
		isEditAnswer = false;
	};
</script>

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	<span class="text-xl"
		>{question.question_text.substring(0, 350)}{question.question_text.length > 350
			? '...'
			: ''}</span
	>
	{#if hasAnswer}
		{#if question.question_info.length > 0}
			<span>{question.question_info}</span>
		{/if}
		<div
			class="w-full flex flex-1 p-2 flex-col flex-nowrap justify-start items-start overflow-hidden relative backdrop-blur-lg rounded-xl glass-bg"
		>
			{#if isEditAnswer}
				<textarea
					name="answer-{question.id}"
					id="answer-{question.id}"
					class="w-full h-full overflow-x-hidden overflow-y-auto scroll-bar bg-transparent text-base p-2 resize-none focus:outline-none active:outline-none"
					placeholder="type your answer..."
					bind:value={answer}
				></textarea>
			{:else}
				<div
					class="w-full h-full overflow-x-hidden overflow-y-auto scroll-bar bg-transparent text-base p-2 resize-none focus:outline-none active:outline-none markdown"
				>
					<SvelteMarkdown source={userAnswer} renderers={{ link: Link }}></SvelteMarkdown>
				</div>
			{/if}
			{#if hasError}
				<span
					class="error-text absolute left-2 bottom-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold"
					transition:slide={{ axis: 'x' }}
				>
					{errorMessages}
				</span>
			{/if}
		</div>
		<div class="w-full flex flex-row flex-nowrap justify-end gap-x-2">
			{#if isEditAnswer}
				<button
					class="btn-icon p-1 action-btn text-xl"
					aria-label="Cancel My Changes"
					on:click={cancel}
				>
					<Icon icon={IconsEnum.CANCEL_CHANGE}></Icon>
				</button>
			{/if}
			{#if isEditAnswer}
				<button
					class="btn-icon p-1 action-btn text-xl"
					on:click={saveAnswer}
					aria-label="Save My Changes"
				>
					<Icon icon={IconsEnum.SAVE}></Icon>
				</button>
			{/if}
			{#if !isEditAnswer}
				<button class="btn-icon p-1 action-btn text-xl" aria-label="Edit" on:click={setEditAnswer}>
					<Icon icon={IconsEnum.EDIT}></Icon>
				</button>
			{/if}
		</div>
	{/if}
</div>
