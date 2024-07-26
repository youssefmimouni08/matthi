<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Question } from '../../../../ambient';
	import { slide } from 'svelte/transition';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import { questionBuilder } from '$lib/utils/questions.helper';

	export let question: Question = {} as Question;
	let hasError = false;
	let errorMessages = '';
	let isSuccess = false;
	$: isSuccess = question.isSuccess ?? false;
	let website = '';
	$: website = String(question.userAnswer);
	let isEdit = false;

	let hasAnswer = false;

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer ?? '';

	const qBuilder = questionBuilder();
	const { dispatch } = useBusEvent();

	const validate = () => {
		hasError = false;
		errorMessages = '';
		if (website.length == 0) {
			errorMessages = 'Please enter your website';
		}
		hasError = errorMessages.length > 0;
	};

	const saveDomain = () => {
		validate();
		if (hasError) return;
		// const setAnswerRes = qBuilder.setUserAnswer(question.id, website);
		// if (setAnswerRes) {
		// 	qBuilder.setQuestionSuccess(question.id);
		// 	question.userAnswer = website;
		// 	isSuccess = true;
		// }
	};

	function setEdit(edit: boolean) {
		isEdit = edit;
	}

	function cancel() {
		website = String(question.userAnswer);
		setEdit(false);
	}
</script>

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	<span class="text-xl">{question.question_text}</span>
	{#if isSuccess}
		{#if question.question_info.length > 0}
			<span>{question.question_info}</span>
		{/if}

		<div
			class="w-full flex flex-1 p-2 flex-col flex-nowrap justify-center items-center overflow-hidden backdrop-blur-lg rounded-xl glass-bg"
		>
			<div class="w-full flex-1 flex flex-row flex-nowrap justify-start items-start gap-4 relative">
				{#if !isSuccess || isEdit || String(question.userAnswer).length > 0}
					<div
						class="flex-1 h-full glass-surface flex flex-col flex-nowrap justify-start items-start gap-2 p-4"
					>
						<div
							class="w-[min(300px,100%)] flex flex-row flex-nowrap justify-start items-center gap-4"
						>
							<Icon icon={IconsEnum.WEB} class="text-2xl"></Icon>
							{#if hasAnswer && isEdit}
								<input
									type="text"
									placeholder="Your website ..."
									bind:value={website}
									class="flex-1 bg-transparent focus:outline-none active:outline-none text-xl font-semibold"
									disabled={!isSuccess || !isEdit}
								/>
							{:else}
								<div class="flex-1 bg-transparent focus:outline-none active:outline-none">
									{userAnswer ?? ''}
								</div>
							{/if}
						</div>
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
			<div class="flex flex-row flex-nowrap justify-end items-center w-full gap-4">
				{#if isSuccess && isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Cancel My Changes"
						on:click={() => {
							setEdit(false);
						}}
					>
						<Icon icon={IconsEnum.CANCEL_CHANGE}></Icon>
					</button>
				{/if}
				{#if isSuccess && isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={saveDomain}
						aria-label="Save My Changes"
					>
						<Icon icon={IconsEnum.SAVE}></Icon>
					</button>
				{/if}
				{#if isSuccess && !isEdit}
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
			</div>
		</div>
	{/if}
</div>
