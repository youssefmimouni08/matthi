<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Question } from '../../../../ambient';
	import { IconsEnum } from '$lib/constants';
	import { slide } from 'svelte/transition';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';

	export let question: Question = {} as Question;

	let email = '';
	let hasError = false;
	let errorMessages = '';
	let hasAnswer = false;
	let isEditAnswer = false;

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer ?? '';

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const validateEmail = () => {
		errorMessages = '';
		hasError = false;
		if (email.length == 0) {
			errorMessages = 'Email is required';
		} else if (!emailPattern.test(email)) {
			errorMessages = 'Invalid Email';
		}
		hasError = errorMessages.length > 0;
	};

	const saveAnswer = () => {
		validateEmail();
		if (hasError) return;
		// const isSuccess = questionBuilder().setUserAnswer(question.id, email);
		// if (isSuccess) {
		// 	questionBuilder().setQuestionSuccess(question.id);
		// 	question.userAnswer = email;
		// 	cancel();
		// }
	};

	const cancel = () => {
		email = String(question.userAnswer);
		setEditAnswer(false);
	};

	const setEditAnswer = (isEdit: boolean = true) => {
		isEditAnswer = isEdit;
	};
</script>

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	<span class="text-xl">{question.question_text}</span>
	{#if hasAnswer}
		<div
			class="w-full flex flex-1 p-4 flex-col flex-nowrap justify-start items-start overflow-hidden relative backdrop-blur-lg rounded-xl glass-bg"
		>
			<div
				class="w-[min(450px,100%)] flex flex-row flex-nowrap justify-start items-center rounded-full gap-4"
			>
				<Icon icon={IconsEnum.EMAIL} class="text-2xl"></Icon>
				{#if isEditAnswer}
					<input
						type="email"
						placeholder="Your Email ..."
						bind:value={email}
						class="flex-1 bg-transparent focus:outline-none active:outline-none font-semibold"
					/>
				{:else}
					<div class="flex-1 bg-transparent focus:outline-none active:outline-none font-semibold">
						{userAnswer}
					</div>
				{/if}
			</div>
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
	{/if}
</div>
