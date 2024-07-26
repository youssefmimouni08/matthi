<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import type { Option, Question } from '../../../../ambient';
	import { slide } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { getHighlightText } from '$lib/utils/string.helper';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';

	export let question: Question = {} as Question;

	const options: Array<Option> = question.option ?? [];

	let answer = '';
	let search = '';
	let hasAnswer = false;
	let isEditAnswer = false;
	let hasError = false;
	let errorMessages = 'Please select your answer';

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer ?? '';

	let filteredOptions =
		search.length == 0
			? [...options]
			: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase()));
	$: search,
		(filteredOptions =
			search.length == 0
				? [...options]
				: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase())));

	const setAnswer = (value: string) => {
		if (hasAnswer && !isEditAnswer) return;
		answer = value;
		search = '';
	};

	const saveAnswer = () => {
		hasError = false;
		if (String(answer).length == 0) {
			hasError = true;
			return;
		}
		// const isSuccess = questionBuilder().setUserAnswer(question.id, answer);
		// if (isSuccess) {
		// 	questionBuilder().setQuestionSuccess(question.id);
		// 	question.userAnswer = answer;
		// 	cancel();
		// }
	};

	const cancel = () => {
		answer = String(question.userAnswer);
		setEditAnswer(false);
	};

	const setEditAnswer = (isEdit: boolean = true) => {
		isEditAnswer = isEdit;
	};
</script>

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	<span class="text-xl">{question.question_text}</span>
	{#if hasAnswer}
		{#if question.question_info.length > 0}
			<span>{question.question_info}</span>
		{/if}

		<div
			class="w-full flex flex-1 p-2 flex-col flex-nowrap justify-start items-start overflow-hidden relative backdrop-blur-lg rounded-xl glass-bg gap-4"
		>
			{#if isEditAnswer}
				<div class="w-full flex-1 flex flex-col flex-nowrap gap-2 overflow-hidden">
					<div
						class="w-[min(350px,100%)] flex flex-row flex-nowrap justify-start items-center border-2 border-surface-5 rounded-full px-4 py-2 gap-4 email-input"
						transition:slide={{ axis: 'y' }}
					>
						<input
							type="text"
							placeholder="Search ..."
							bind:value={search}
							class="flex-1 bg-transparent focus:outline-none active:outline-none font-semibold"
						/>
						<Icon icon={IconsEnum.SEARCH} class="text-3xl"></Icon>
					</div>
					<div
						class="w-full max-h-[min(500px,35vh)] digit-bg rounded-xl flex flex-col flex-nowrap justify-start items-start divide-y-[1px] divide-surface-5 overflow-x-hidden overflow-y-auto scroll-bar no-scroll-bar"
						on:scroll|stopPropagation
					>
						{#each filteredOptions.sort((a, b) => {
							return a.value == String(question.userAnswer) ? -1 : 0;
						}) as option (option.value)}
							<button
								class="w-full flex flex-row flex-nowrap justify-start items-start px-4 py-2 font-semibold hover:bg-surface-8 hover:text-on-surface-8 hover:opacity-70 transition-all disabled:opacity-50 disabled:pointer-events-none"
								on:click={() => setAnswer(option.value)}
								disabled={option.value == question.userAnswer || !hasAnswer || !isEditAnswer}
							>
								<span class="flex-1 text-left">
									{#each getHighlightText(option.display, search) as text, index (index)}
										<span class={index === 1 ? 'bg-surface-4 text-on-surface-1' : ''}>{text}</span>
									{/each}
								</span>
								{#if option.value == question.userAnswer}
									<span class="p-2 rounded-full text-xs bg-surface-3 text-on-surface-3">
										Your answer
									</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
				{#if hasError}
					<span
						class="error-text absolute left-2 bottom-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold"
						transition:slide={{ axis: 'x' }}
					>
						{errorMessages}
					</span>
				{/if}
			{/if}
			<div class="w-full flex flex-row justify-start items-center gap-2 flex-nowrap">
				{#if isEditAnswer}
					<div class="flex flex-row flex-nowrap justify-start items-center gap-2">
						{#if answer.length > 0}
							<span class="btn-ghost border-on-primary text-on-primary px-4 py-1">
								{answer}
							</span>
						{/if}
					</div>
				{:else}
					<div class="flex flex-row flex-nowrap justify-start items-center gap-2">
						{#if question.userAnswer && question.userAnswer.length > 0}
							<span class="btn-ghost border-on-primary text-on-primary px-4 py-1">
								{userAnswer}
							</span>
						{/if}
					</div>
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
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Edit"
						on:click={() => {
							setEditAnswer(true);
						}}
					>
						<Icon icon={IconsEnum.EDIT}></Icon>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
