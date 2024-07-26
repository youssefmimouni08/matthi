<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import type { Option, Question } from '../../../../ambient';

	import Icon from '@iconify/svelte';
	import { getHighlightText } from '$lib/utils/string.helper';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Message } from '../../../../../ambient';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import type { Writable } from 'svelte/store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import { onMount } from 'svelte';
	import { getApplicationStore } from '$lib/stores/application.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();
	let options: Array<Option> = question.options ?? [];
	const questionFactory = questionBuilder();
	const applicationStore = getApplicationStore();

	let answer: Array<string> = [];
	let userAnswer: Array<string> = [];
	let search = '';
	let hasAnswer = false;
	let isEditAnswer = false;
	let hasError = false;
	let errorMessages = 'Please select at least one answer';
	let isMarkAnswer: boolean = false;
	let isSuggested: boolean = false;
	let isSubmitted = false;

	$: isSubmitted = $applicationStore.isSubmitted;

	$: answer = message.display.split(',');
	$: question = !!message.for
		? $questionsStore.find((x) => x.id == message.for) ?? ({} as Question)
		: ({} as Question);
	$: hasAnswer = String(question.userAnswer).length > 0;
	$: options = question.options ?? [];
	$: userAnswer = Array.isArray(question.userAnswer) ? question.userAnswer : [question.userAnswer];

	let filteredOptions =
		search.length == 0
			? [...options]
			: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase()));
	$: search,
		(filteredOptions = [...options].filter((o) =>
			o.display.toLowerCase().includes(search.toLowerCase())
		));
	$: isMarkAnswer = message.isAnswer ?? false;
	$: isSuggested = message.is_suggested ?? false;

	const setAnswer = (value: string) => {
		if (!answer.includes(value)) answer = [...answer, value];
		if (answer.length > 0) {
			saveAnswer();
		} else {
			removeUserAnswer();
		}
	};

	const saveAnswer = () => {
		questionFactory.setUserAnswer(question.id, answer);
		questionFactory.markAnswer(question.id, message.id, answer.toString());
		useMessagesStore().markAnswer(question.id, message.id, answer.toString());
		questionFactory.setQuestionSuccess(question.id);
		isMarkAnswer = true;
		isEditAnswer = false;
		cancel();
	};

	const removeAnswer = (value: string) => {
		answer = answer.filter((x) => x !== value);
		if (answer.length > 0) {
			saveAnswer();
		} else {
			removeUserAnswer();
		}
	};

	const cancel = () => {
		answer = question.userAnswer as Array<string>;
		setEditAnswer(false);
	};

	const setEditAnswer = (isEdit: boolean = true) => {
		isEditAnswer = isEdit;
	};

	const removeUserAnswer = () => {
		answer = [];
		const emptyAnswer = answer.toString();
		questionFactory.setUserAnswer(question.id, emptyAnswer);
		questionFactory.removeAnswer(question.id, message.id, emptyAnswer);
		useMessagesStore().removeAnswer(question.id, message.id, emptyAnswer);
		questionFactory.setQuestionUnsuccess(question.id);
		isMarkAnswer = true;
		isEditAnswer = false;
	};

	onMount(() => {
		if (message.is_automatic_mark) {
			saveAnswer();
		}
	});
</script>

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm text-on-primary p-4 msg gap-4 bg-[hsla(from_var(--surface-5)_h_s_l_/_0.3)] animated-slide-in-revert my-2"
	data-ai-suggestion={isSuggested}
>
	<div class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none gap-4">
		{#if filteredOptions.length > 0}
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
					class="w-full flex-1 flex flex-row gap-4 flex-wrap justify-start items-start overflow-hidden"
					on:scroll|stopPropagation
				>
					<div
						class="w-full flex-1 digit-bg rounded-xl flex flex-col flex-nowrap justify-start items-start divide-y-[1px] divide-surface-5 overflow-x-hidden overflow-y-auto scroll-bar no-scroll-bar max-h-[350px]"
						data-answer={isMarkAnswer}
					>
						{#each filteredOptions as option (option.value)}
							<button
								class="w-full flex flex-row flex-nowrap justify-start items-start px-4 py-2 text-base hover:bg-surface-8 hover:text-primary hover:opacity-70 transition-all disabled:opacity-50 disabled:pointer-events-none"
								on:click={() => setAnswer(option.value)}
								disabled={answer.includes(option.value) || isSubmitted}
							>
								<span class="flex-1 text-left">
									{#each getHighlightText(option.display, search) as text, index (index)}
										<span class={index === 1 ? 'bg-surface-4 text-on-surface-1' : ''}>{text}</span>
									{/each}
								</span>
								{#if answer.includes(option.value)}
									<span class="p-2 rounded-full text-xs bg-on-primary text-primary">
										Your answer
									</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
		{#if hasError}
			<span
				class="error-text absolute left-2 bottom-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold"
			>
				{errorMessages}
			</span>
		{/if}

		<div class="w-full flex flex-col justify-start items-start gap-2 flex-nowrap">
			<div class="flex flex-row flex-wrap justify-start items-center gap-2">
				{#each answer.filter((x) => x.length > 0) as a}
					<button
						class="btn-ghost border-on-primary text-on-primary px-4 py-1 !flex !flex-row !flex-nowrap !justify-start !items-center gap-2"
						on:click={() => removeAnswer(a)}
						disabled={isSubmitted}
					>
						<span>{a}</span>
						<Icon icon={IconsEnum.CLOSE} class="text-xl"></Icon>
					</button>
				{/each}
			</div>
		</div>

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
					on:click={removeUserAnswer}
				>
					<Icon icon={IconsEnum.CHECK}></Icon>
				</button>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	[data-ai-suggestion='true'] {
		width: calc(min(750px, 100%) - 48px);
		@apply ml-12 bg-blue-900/15;
	}
</style>
