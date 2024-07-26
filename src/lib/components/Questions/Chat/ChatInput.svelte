<script lang="ts">
	import { IconsEnum, QuestionTypes } from '$lib/constants';
	import { getActiveQuestion } from '$lib/stores/activeQuestion.store';
	import Icon from '@iconify/svelte';
	import type { Application, Message, Option, Question } from '../../../../ambient';
	import { onMount } from 'svelte';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import type { Writable } from 'svelte/store';
	import { getHighlightText } from '$lib/utils/string.helper';
	import { getApplicationStore } from '$lib/stores/application.store';

	export let message = '';
	export let sendMessage = (msg: Message) => {};
	const activeQuestionStore: Writable<string | number | null> = getActiveQuestion();
	const questionStore: Writable<Question[]> = getQuestionsStore();
	const applicationStore: Writable<Application> = getApplicationStore();

	let questions: Array<Question> = [] as Array<Question>;
	let activeQuestionUnsubscribe = () => {};
	let questionUnsubscribe = () => {};
	let activeQuestionId: string = '';
	let activeQuestion: Question = {} as Question;
	let filteredOptions: Array<Option> = [];

	const DEMO_VERIFYING_CODE = '123456';

	$: activeQuestionId,
		(activeQuestion =
			questions.length > 0
				? questions.find((x) => x.id == activeQuestionId) ?? ({} as Question)
				: ({} as Question));

	$: activeQuestion,
		message,
		(filteredOptions =
			!!activeQuestion.option && message.length > 0
				? activeQuestion.option.filter((option) => {
						return option.display.toLowerCase().includes(message.toLowerCase());
					})
				: []);

	const setDropdownAnswer = (value: string) => {
		message = value;
	};

	const handleInput = (event) => {
		const isEnterPressed = event.key.toLowerCase() === 'enter';
		const isCombineKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
		if (isCombineKey || !isEnterPressed) return;
		handleSendMessage();
	};


	function handleSendMessage() {
		const msg: Message = {
			id: '',
			is_send: true,
			is_system: false,
			is_dropped: false,
			application_id: $applicationStore.id,
			message_object: {
				display: message,
				is_answer: false,
				is_primary: false,
				question_id: activeQuestionId ?? '',
				type: QuestionTypes.TEXT,
				is_suggested: false
			}
		};
		sendMessage(msg);
		message = '';
	}

	onMount(() => {
		if (questionStore) {
			questionUnsubscribe = questionStore.subscribe((val) => {
				questions = [...val];
			});
		}

		if (activeQuestionStore) {
			activeQuestionUnsubscribe = activeQuestionStore.subscribe((val) => {
				if (!!val) {
					activeQuestionId = String(val);
				}
			});
		}

		return () => {
			questionUnsubscribe();
			activeQuestionUnsubscribe();
		};
	});
</script>

{#if !!activeQuestion.type && activeQuestion.type == QuestionTypes.EMAIL_VERIFICATION}
	<button
		class="btn-ghost mb-4"
		on:click={() => {
			message = DEMO_VERIFYING_CODE;
			handleSendMessage();
		}}>DEMO EMAIL VERIFYING CODE : {DEMO_VERIFYING_CODE}</button
	>
{/if}
{#if filteredOptions.length > 0}
	<div
		class="w-[min(750px,100%)] max-h-24 flex flex-col flex-nowrap justify-start items-start overflow-hidden bg-primary backdrop-blur-3xl border-2 border-b-0 border-surface-5 rounded-t-2xl overflow-x-hidden overflow-y-scroll no-scroll-bar overscroll-y-contain !p-0 !gap-0 text-on-primary font-semibold"
	>
		{#each filteredOptions as option (option.value)}
			<button
				class="w-full flex flex-row flex-nowrap justify-start items-start px-4 py-2 border-b-2 last-of-type:border-b-0 hover:bg-[hsla(from_var(--surface-5)_h_s_l_/0.4)] border-surface-5 disabled:opacity-50"
				disabled={option.value == String(activeQuestion.userAnswer)}
				on:click={() => setDropdownAnswer(option.value)}
			>
				<span class="flex-1 text-left">
					{#each getHighlightText(option.display, message) as text, index (index)}
						<span class={index === 1 ? 'bg-surface-4 text-on-surface-1' : ''}>{text}</span>
					{/each}
				</span>
				{#if option.value == String(activeQuestion.userAnswer)}
					<span class="p-2 rounded-full text-xs bg-surface-8 text-primary"> Your answer </span>
				{/if}
			</button>
		{/each}
	</div>
{/if}

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-center border-2 rounded-lg px-4 py-2 gap-4 bg-[hsla(from_var(--primary)_h_s_l_/_0.9)] text-on-primary backdrop-blur-3xl shadow-2xl shadow-primary border-[hsla(from_var(--primary)_h_s_l_/0.8)]"
	data-has-options={!!activeQuestion.option && activeQuestion.option.length > 0}
>
	<Icon icon={IconsEnum.MIC} class="text-xl text-surface-5"></Icon>
	<input
		placeholder="Type your answer..."
		bind:value={message}
		class="flex-1 bg-transparent focus:outline-none active:outline-none font-semibold
        placeholder:text-[hsla(from_var(--on-primary)_h_s_l_/_0.7)] resize-none overflow-x-hidden overflow-y-auto no-scroll-bar"
		on:keypress={(e) => handleInput(e)}
	/>
	<div class="flex flex-row flex-nowrap justify-end items-stretch gap-x-4">
		<button
			class="flex-row flex-nowrap bg-surface-5 rounded-full flex justify-center items-center w-10 aspect-square gap-2 text-primary"
			on:click={handleSendMessage}
		>
			<Icon icon={IconsEnum.ARROW_UP} class="text-xl"></Icon>
		</button>
	</div>
</div>

<style lang="postcss">
	[data-has-options='true'] {
		-moz-transition: all 0.03s;
		-o-transition: all 0.03s;
		-webkit-transition: all 0.03s;
		transition: all 0.51s;
		@apply rounded-t-none rounded-b-3xl border-2 border-surface-5;
	}
</style>
