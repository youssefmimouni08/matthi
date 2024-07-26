<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Question } from '../../../../ambient';
	import { fade } from 'svelte/transition';
	import type { Writable } from 'svelte/store';
	import type { Application, Message } from '../../../../../ambient';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { getApplicationStore } from '$lib/stores/application.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	let pitchDeskUrl = '';
	const questionsStore: Writable<Question[]> = getQuestionsStore();
	const applicationStore: Writable<Application> = getApplicationStore();

	$: pitchDeskUrl = $applicationStore.pitchDeskUrl;

	let isSuccess = false;
	let fileURL: string = '';

	$: question = !!message.for
		? $questionsStore.find((x) => x.id == message.for) ?? ({} as Question)
		: ({} as Question);
	$: isSuccess = question.isSuccess;
	$: fileURL = message.display ?? '';

	let isOpenPDFPreview = false;

	const setOpenPreview = (isOpen: boolean) => {
		isOpenPDFPreview = isOpen;
	};
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

<div class="w-[min(750px,100%)] flex flex-col flex-nowrap gap-4 items-end justify-end py-2">
	<div
		class=" flex flex-nowrap justify-start items-start rounded-sm gap-4 p-4 bg-[hsla(from_var(--surface-8)_h_s_l_/0.1)] text-on-primary"
	>
		<div
			class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none gap-4 whitespace-pre-wrap"
		>
			<span>You have uploaded a file</span>

			<button
				class="flex flex-col flex-nowrap justify-center items-center p-2 btn self-center"
				transition:fade
				on:click|stopPropagation={() => setOpenPreview(true)}
			>
				<Icon icon={IconsEnum.PDF} class="text-5xl self-center"></Icon>
			</button>

			<div class="w-full flex flex-col flex-nowrap overflow-hidden gap-4">
				{#if pitchDeskUrl.length > 0 && pitchDeskUrl == fileURL}
					<div
						class="btn-icon action-btn text-xl text-primary bg-surface-5 rounded-full p-1 flex w-max self-end justify-center items-center"
						aria-label="Your Pitch Desk"
					>
						<Icon icon={IconsEnum.CHECK}></Icon>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
