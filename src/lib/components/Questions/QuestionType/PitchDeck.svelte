<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Application, Question } from '../../../../ambient';
	import { browser } from '$app/environment';
	import { slide, fade } from 'svelte/transition';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { getApplicationStore } from '$lib/stores/application.store';
	import type { Writable } from 'svelte/store';

	export let question: Question = {} as Question;
	let hasError = false;
	let errorMessages = '';
	let isSuccess = false;
	$: isSuccess = question.isSuccess ?? false;
	let file;
	let fileURL: string = '';
	let fileName = '';
	let isOpenPDFPreview = false;
	let isReviewing = false;
	let isEdit = false;

	const qBuilder = questionBuilder();
	const applicationStore: Writable<Application> = getApplicationStore();

	const validate = () => {
		hasError = false;
		errorMessages = '';
		if (!file) {
			errorMessages = 'Please upload your pitch desk';
		}
		hasError = errorMessages.length > 0;
	};

	const savePitchDesk = () => {
		validate();
		if (hasError) return;
		// if (fileURL.length > 0) {
		// 	question.file = fileURL;
		// 	qBuilder.setFileToQuestion(question.id, fileURL);
		// }
		// applicationStore.update((x) => Object.assign(x, { hasPitchDesk: true }));
		// isReviewing = true;

		// setTimeout(() => {
		// 	isSuccess = true;
		// 	isReviewing = false;
		// 	qBuilder.setQuestionSuccess(question.id);
		// 	cancel();
		// }, 2000);
	};

	const handleUploadFile = (event) => {
		const files = (event.target as HTMLInputElement).files;
		if (browser && !!files && files.length > 0) {
			file = files[0];
			fileURL = URL.createObjectURL(file);
			fileName = file.name;
		}
	};

	const setOpenPreview = (isOpen: boolean) => {
		isOpenPDFPreview = isOpen;
	};

	function setEdit(edit: boolean) {
		isEdit = edit;
	}

	function cancel() {
		// fileURL = question.file;
		setEdit(false);
	}
</script>

{#if fileURL?.length > 0 && isOpenPDFPreview}
	<div class="fixed top-0 left-0 w-full h-full flex justify-center items-center p-4 z-50">
		<button
			class="bg-surface-8 p-2 flex flex-col flex-nowrap justify-center items-center rounded-full absolute top-4 right-4 z-50"
			on:click={() => setOpenPreview(false)}
		>
			<Icon icon={IconsEnum.CLOSE}></Icon>
		</button>
		<iframe src={fileURL} frameborder="0" width="100%" height="100%" title="Pitch Desk Preview"
		></iframe>
	</div>
{/if}

<div class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2">
	{#if isReviewing}
		<div
			class="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-4 z-50 loader-bg backdrop-blur-3xl rounded-2xl gap-8"
		>
			<h3 class="text-2xl text-center text-balance">Your pitch deck is currently being reviewed</h3>
			<span class="loader"></span>
		</div>
	{/if}

	<span class="text-xl">{question.question_text}</span>
	{#if question.question_info.length > 0}
		<span>{question.question_info}</span>
	{/if}

	{#if isSuccess}
		<div
			class="w-full flex flex-1 p-2 flex-col flex-nowrap justify-center items-center overflow-hidden backdrop-blur-lg rounded-xl glass-bg gap-4"
		>
			<div class="w-full flex-1 flex flex-row flex-nowrap justify-start items-start gap-4 relative">
				{#if isEdit || String(question.userAnswer ?? '').length > 0}
					<div
						class="flex-1 h-full glass-surface flex flex-col flex-nowrap justify-center items-center gap-4 p-4"
					>
						{#if isEdit}
							<span class="w-full text-center text-balance"
								>Click <label
									for="pitch-desk-file"
									class="uppercase cursor-pointer p-[4px] rounded-md shadow-inner shadow-surface-1 bg-[#25B8C7]"
									>Here</label
								> to select a file or drag and drop it into this field</span
							>

							<span class="w-full text-center text-balance"
								>Accepted file: <span class="font-bold text-surface-4">PDF</span></span
							>
						<!-- {:else if String(question.file ?? '').length > 0}
							<span class="w-full text-center text-balance text-xl font-semibold"
								>Uploaded File:</span
							> -->
						{/if}
						{#if fileName.length > 0 || String(question.userAnswer ?? '').length > 0}
							<button
								class="max-w-full flex flex-col flex-nowrap justify-center items-center btn"
								transition:fade
								on:click|stopPropagation={() => setOpenPreview(true)}
							>
								<Icon icon={IconsEnum.PDF} class="text-4xl self-center"></Icon>
								<span class="text-sm font-normal">{fileName}</span>
							</button>
						{/if}
					</div>
					<input
						type="file"
						accept="application/pdf"
						name="pitch-desk-file"
						id="pitch-desk-file"
						class="hidden"
						on:change={handleUploadFile}
					/>
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
						on:click={cancel}
					>
						<Icon icon={IconsEnum.CANCEL_CHANGE}></Icon>
					</button>
				{/if}
				{#if isSuccess && isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={savePitchDesk}
						aria-label="Save My Changes"
					>
						<Icon icon={IconsEnum.SAVE}></Icon>
					</button>
				{/if}
				{#if isSuccess && !isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Change your pitch desk"
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
