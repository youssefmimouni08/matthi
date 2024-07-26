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

	let answer: Array<string> = [];
	let userAnswer: Array<string> = [];
	let search = '';
	let hasAnswer = false;
	let isEditAnswer = false;
	let hasError = false;
	let errorMessages = 'Please select at least one answer';

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer?.split(',') ?? ([] as Array<string>);

	let filteredOptions =
		search.length == 0
			? [...options]
			: [...options].filter((o) => o.display.toLowerCase().includes(search.toLowerCase()));
	$: search,
		(filteredOptions = [...options].filter(
			(o) => o.display.toLowerCase().includes(search.toLowerCase()) && !answer.includes(o.value)
		));

	const setAnswer = (value: string) => {
		if (hasAnswer && !isEditAnswer) return;
		if (!answer.includes(value)) answer = [...answer, value];
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

	const removeAnswer = (value: string) => {
		answer = answer.filter((x) => x !== value);
	};

	const cancel = () => {
		answer = question.userAnswer?.split(',') as Array<string>;
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
						{#each filteredOptions as option (option.value)}
							<button
								class="w-full flex flex-row flex-nowrap justify-start items-start px-4 py-2 font-semibold hover:bg-surface-8 hover:text-on-surface-8 hover:opacity-70 transition-all disabled:opacity-50 disabled:pointer-events-none"
								on:click={() => setAnswer(option.value)}
								disabled={!hasAnswer || !isEditAnswer}
							>
								<span class="flex-1 text-left">
									{#each getHighlightText(option.display, search) as text, index (index)}
										<span class={index === 1 ? 'bg-surface-4 text-on-surface-1' : ''}>{text}</span>
									{/each}
								</span>
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
			<div class="w-full flex flex-col justify-start items-start gap-2 flex-nowrap">
				{#if isEditAnswer}
					<div class="flex flex-row flex-wrap justify-start items-center gap-2">
						{#if answer.length > 0}
							{#each answer as a}
								<button
									class="btn-ghost border-on-primary text-on-primary px-4 py-1 flex flex-row justify-center gap-x-2"
									on:click={() => removeAnswer(a)}
								>
									<span>{a}</span>
									<Icon icon={IconsEnum.CLOSE} class="text-xl"></Icon>
								</button>
							{/each}
						{/if}
					</div>
				{:else}
					<div class="flex flex-row flex-wrap justify-start items-center gap-2">
						{#if userAnswer.length > 0}
							{#each userAnswer as a}
								{#if a.length > 0}
									<span class="btn-ghost border-on-primary text-on-primary px-4 py-1">
										<span>{a}</span>
									</span>
								{/if}
							{/each}
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
