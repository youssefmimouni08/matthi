<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message, Question } from '../../../../../ambient';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();

	let isMarkAnswer: boolean = false;
	let isSuggested: boolean = false;

	$: isMarkAnswer = message.isAnswer ?? false;
	$: isSuggested = message.is_suggested ?? false;
	$: question = !!message.for
		? $questionsStore.find((x) => x.id == message.for) ?? ({} as Question)
		: ({} as Question);

	const openReview = () => {
		useBusEvent().dispatch(BusEvents.OPEN_REVIEW, [false]);
	};
</script>

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm text-on-primary p-4 msg gap-x-4"
>
	<div class="w-12 aspect-square rounded-full text-surface-8 flex justify-center items-center p-1">
		<Icon icon={IconsEnum.ROBOT} class="text-3xl"></Icon>
	</div>

	<div
		class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap gap-1"
	>
		<span class="w-full text-left">
			{message.display}
		</span>

		<div class="w-full flex flex-row flex-nowrap justify-end items-stretch gap-1">
			<button class="btn-icon p-1 action-btn text-xl" on:click={openReview} aria-label="Open review">
				<Icon icon={IconsEnum.REVIEW}></Icon>
			</button>
		</div>
	</div>
</div>
