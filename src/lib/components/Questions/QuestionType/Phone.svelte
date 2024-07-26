<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Question } from '../../../../ambient';
	import { IconsEnum } from '$lib/constants';
	import { slide } from 'svelte/transition';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import TelephoneCodes from '../Shares/TelephoneCodes.svelte';
	import codes from '$lib/assets/json/codes.json';

	export let question: Question = {} as Question;

	let phoneNr = '';
	let hasError = false;
	let errorMessages = '';
	let hasAnswer = false;
	let isEditAnswer = false;
	let telInput: HTMLInputElement;
	let telephone = {
		country: 'United Arab Emirates',
		code: '+971',
		iso: 'AE'
	};
	let openTelDropdown = false;

	$: code = codes.find((x) => String(userAnswer).startsWith(x.code)) ?? {
		country: 'United Arab Emirates',
		code: '+971',
		iso: 'AE'
	};
	$: code, (telephone = Object.assign(telephone, code));
	$: code, (phoneNr = String(userAnswer).replace(code.code, ''));

	const setOpenTelDropdown = (open: boolean) => {
		openTelDropdown = open;
	};
	const closeAndFocusTelDropdown = () => {
		setOpenTelDropdown(false);
		telInput.focus();
	};

	$: hasAnswer = String(question.userAnswer ?? '').length > 0;
	$: userAnswer = question.userAnswer ?? '';

	const PHONE_REGEX = /^\+?[0-9\s-]+$/;

	const buildTelephoneNumber = () => {
		return `${telephone.code}${phoneNr}`;
	};
	const validateTelephone = () => {
		errorMessages = '';
		hasError = false;
		let phone = buildTelephoneNumber();
		if (phone.length == 0) {
			errorMessages = 'Telephone Number is required';
		} else if (!PHONE_REGEX.test(phone)) {
			errorMessages = 'Invalid Telephone Number';
		}
		hasError = errorMessages.length > 0;
	};

	const saveAnswer = () => {
		validateTelephone();
		if (hasError) return;
		// const isSuccess = questionBuilder().setUserAnswer(question.id, phoneNr);
		// if (isSuccess) {
		// 	questionBuilder().setQuestionSuccess(question.id);
		// 	question.userAnswer = phoneNr;
		// 	cancel();
		// }
	};

	const cancel = () => {
		phoneNr = String(question.userAnswer);
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
			class="w-full flex flex-1 p-2 flex-col flex-nowrap justify-start items-start overflow-hidden relative backdrop-blur-lg rounded-xl glass-bg"
		>
			<div
				class="w-[min(450px,100%)] flex-1 flex flex-col flex-nowrap justify-start items-start relative p-2"
			>
				<div
					class="w-full flex flex-row flex-nowrap justify-start items-center gap-x-2 divide-x-2 divide-surface-5 gap-4"
				>
					{#if isEditAnswer}
						<button
							class="flex flex-row justify-start items-center flex-nowrap gap-x-2 text-sm"
							on:click|stopPropagation={() => setOpenTelDropdown(!openTelDropdown)}
						>
							<Icon icon={`circle-flags:${telephone.iso.toLowerCase()}`} class="text-xl"></Icon>
							<span>{telephone.iso} ({telephone.code})</span>
							<Icon icon={IconsEnum.EXPAND} vFlip={openTelDropdown} class="text-2xl"></Icon>
						</button>
						<input
							type="text"
							bind:value={phoneNr}
							name="setting-profile-tel"
							id="setting-profile-tel"
							class="flex-1 h-full bg-transparent pl-4"
							bind:this={telInput}
						/>
					{:else}
						<div class="flex flex-row justify-start items-center flex-nowrap gap-x-2 text-sm">
							<Icon icon={`circle-flags:${telephone.iso.toLowerCase()}`} class="text-xl"></Icon>
							<span>{telephone.iso} ({telephone.code})</span>
						</div>
						<div class="flex-1 h-full bg-transparent pl-4">{phoneNr}</div>
					{/if}
				</div>
				<div
					class="w-full grid transition-[ grid-template-rows] ease-linear duration-100 grid-rows-[var(--gtr)]"
					style="--gtr: {openTelDropdown ? 1 : 0}fr"
				>
					<div
						class="w-full flex flex-col justify-start items-start overflow-hidden"
						data-open={openTelDropdown}
					>
						<TelephoneCodes bind:telephone close={closeAndFocusTelDropdown}></TelephoneCodes>
					</div>
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

<style lang="postcss">
	[data-open='true'] {
		@apply h-[20vh] max-h-[20vh];
	}
</style>
