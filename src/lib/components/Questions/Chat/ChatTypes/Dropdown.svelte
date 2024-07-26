<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message, Option, Question } from '../../../../../ambient';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import { getHighlightText } from '$lib/utils/string.helper';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { getApplicationStore } from '$lib/stores/application.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();
	let options: Array<Option> =
		!!message.adjustedOptions && message.adjustedOptions.length > 0
			? message.adjustedOptions
			: question.options ?? [];

	const applicationStore = getApplicationStore();

	const questionFactory = questionBuilder();
	let isEdit: boolean = false;
	let isMarkAnswer: boolean = false;
	let isSuggested: boolean = false;

	let answer = message.display ?? '';
	let hasError = false;

	let search = '';
	let hasAnswer = false;
	let isEditAnswer = false;
	let isSubmitted = false;

	$: isSubmitted = $applicationStore.isSubmitted;

	$: question = !!message.for
		? $questionsStore.find((x) => x.id == message.for) ?? ({} as Question)
		: ({} as Question);
	$: answer = !!question.userAnswer ? String(question.userAnswer) : message.display;
	$: hasAnswer = String(question.userAnswer).length > 0;
	$: options =
		!!message.adjustedOptions && message.adjustedOptions.length > 0
			? message.adjustedOptions
			: question.options ?? [];
	let filteredOptions =
		search.length == 0
			? [...options]
			: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase()));
	$: search,
		(filteredOptions =
			search.length == 0
				? [...options]
				: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase())));
	$: isMarkAnswer = message.isAnswer ?? false;
	$: isSuggested = message.is_suggested ?? false;

	const saveAnswer = () => {
		hasError = false;
		if (answer.length == 0) {
			hasError = true;
			return;
		}
		questionFactory.setUserAnswer(question.id, answer);
		questionFactory.markAnswer(question.id, message.id, answer);
		useMessagesStore().markAnswer(question.id, message.id, answer);
		questionFactory.setQuestionSuccess(question.id);
		isMarkAnswer = true;
		isEdit = false;
		cancel();
	};

	const removeAnswer = () => {
		questionFactory.setUserAnswer(question.id, '');
		questionFactory.removeAnswer(question.id, message.id, '');
		useMessagesStore().removeAnswer(question.id, message.id, '');
		questionFactory.setQuestionUnsuccess(question.id);
		isMarkAnswer = true;
		isEdit = false;
		cancel();
	};

	const setAnswer = (value: string) => {
		answer = value;
		search = '';
		saveAnswer();
	};

	const cancel = () => {
		answer = String(question.userAnswer);
		setEditAnswer(false);
	};

	const setEditAnswer = (isEdit: boolean = true) => {
		isEditAnswer = isEdit;
	};

	onMount(() => {
		if (message.is_automatic_mark) {
			saveAnswer();
		}
	});
</script>

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm text-on-primary p-4 msg gap-4 bg-[hsla(from_var(--surface-5)_h_s_l_/_0.3)] animated-slide-in-revert"
	data-ai-suggestion={isSuggested}
>
	<div class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none gap-4">
		<div class="w-full flex-1 flex flex-col flex-nowrap gap-2 overflow-hidden">
			<div
				class="w-[min(350px,100%)] flex flex-row flex-nowrap justify-start items-center border-2 border-surface-5 rounded-full px-4 py-2 gap-4 email-input"
			>
				<input
					type="text"
					placeholder="Search ..."
					bind:value={search}
					class="flex-1 bg-transparent focus:outline-none active:outline-none text-base font-semibold disabled:opacity-50"
					disabled={isSubmitted}
				/>
				<Icon icon={IconsEnum.SEARCH} class="text-xl"></Icon>
			</div>
			<div
				class="w-full flex-1 digit-bg rounded-xl flex flex-col flex-nowrap justify-start items-start divide-y-[1px] divide-surface-5 overflow-x-hidden overflow-y-auto scroll-bar no-scroll-bar max-h-[350px]"
				data-answer={isMarkAnswer}
				on:scroll|stopPropagation
			>
				{#each filteredOptions.sort((a, b) => {
					return a.value == String(question.userAnswer) ? -1 : 0;
				}) as option (option.value)}
					<button
						class="w-full flex flex-row flex-nowrap justify-start items-start px-4 py-2 text-base hover:bg-surface-8 hover:text-primary hover:opacity-70 transition-all disabled:opacity-50 disabled:pointer-events-none"
						disabled={option.value == answer || isSubmitted}
						on:click={() => setAnswer(option.value)}
					>
						<span class="flex-1 text-left">
							{#each getHighlightText(option.display, search) as text, index (index)}
								<span class={index === 1 ? 'bg-surface-4 text-on-surface-1' : ''}>{text}</span>
							{/each}
						</span>
						{#if option.value == question.userAnswer}
							<span class="p-2 rounded-full text-xs bg-on-primary text-primary"> Your answer </span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<div class="w-full text-left flex flex-row flex-nowrap justify-start items-center gap-2">
			{#if answer.length > 0}
				<span class="btn-ghost border-on-primary text-on-primary px-4 py-1">{answer}</span>
			{/if}
		</div>
		{#if hasError}
			<span
				class="error-text px-4 py-2 inline-block w-max rounded-full whitespace-nowrap text-ellipsis"
				transition:slide={{ axis: 'x' }}>Please select an answer</span
			>
		{/if}

		<div class="w-full flex flex-row flex-nowrap justify-end gap-x-2">
			{#if isSuggested}
				<div class="flex flex-row flex-nowrap flex-1">
					<div
						class=" gap-2 bg-yellow-500 text-black font-semibold rounded-full px-2 py-1 text-xs flex flex-row justify-center flex-nowrap"
					>
						<span>AI Suggestion</span>
					</div>
				</div>
			{/if}
			{#if !isMarkAnswer}
				<button
					class="btn-icon p-1 action-btn text-xl"
					on:click={saveAnswer}
					aria-label="Mark My Answer"
				>
					<Icon icon={IconsEnum.MARK_ON}></Icon>
				</button>
			{:else}
				<button
					class="btn-icon action-btn text-xl text-primary bg-surface-5 rounded-full p-1 flex justify-center items-center"
					aria-label="Your Answer | Click to remove your answer"
					on:click={removeAnswer}
				>
					<Icon icon={IconsEnum.CHECK}></Icon>
				</button>
			{/if}
		</div>
	</div>
</div>