<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message, Question } from '../../../../../ambient';
	import { onMount, tick } from 'svelte';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import SvelteMarkdown from 'svelte-markdown';
	import Link from '../Markdown/Link.svelte';
	import { getApplicationStore } from '$lib/stores/application.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();
	const applicationStore = getApplicationStore();

	const questionFactory = questionBuilder();
	let isEdit: boolean = false;
	let textEditor: HTMLTextAreaElement;
	let isMarkAnswer: boolean = false;

	let answer = message.message_object.display ?? '';
	$: isMarkAnswer = message.message_object.is_answer ?? false;
	$: question = !!message.message_object.question_id
		? ($questionsStore.find((x) => x.id == message.message_object.question_id) ?? ({} as Question))
		: ({} as Question);

	const setEdit = async (edit: boolean) => {
		isEdit = edit;
		answer = message.message_object.display;
		if (edit) {
			await tick();
			if (textEditor) textEditor.focus();
		}
	};

	const setAnswer = async () => {
		// questionFactory.setUserAnswer(question.id, answer);
		// questionFactory.markAnswer(question.id, message.id, answer);
		// useMessagesStore().markAnswer(question.id, message.id, answer);
		// questionFactory.setQuestionSuccess(question.id);
		console.log("set answer")
		const setAnswerResponse = await fetch('/answer/save', {
			method: 'post',
			body: JSON.stringify({
				answer: {
					question_id: message.message_object.question_id,
					application_id: $applicationStore.id,
					user_answer: answer
				}
			})
		}).then((res) => res.json());
		console.log('setAnswerResponse', setAnswerResponse);
		setAnswerResponse.forEach((qd) => {
			questionFactory.setUserAnswer(qd.question_id, qd.user_answer);
			// questionFactory.setQuestionSuccess(qd.question_id);
			// questionFactory.markAnswer(qd.question_id, message.id, getDisplayText());
			// useMessagesStore().markAnswer(qd.question_id, message.id, getDisplayText());
		});
		console.log('setAnswerResponse', setAnswerResponse);

		isMarkAnswer = true;
		isEdit = false;
	};

	const removeAnswer = () => {
		// questionFactory.setUserAnswer(question.id, '');
		// questionFactory.removeAnswer(question.id, message.id, answer);
		// useMessagesStore().removeAnswer(question.id, message.id, answer);
		// questionFactory.setQuestionUnsuccess(question.id);
		isMarkAnswer = true;
		isEdit = false;
	};

	onMount(() => {
		const isAutoMark = message.message_object.is_suggested ?? false;
		if (isAutoMark) {
			setAnswer();
		}
	});
</script>

<div class="w-[min(750px,100%)] flex justify-end items-end py-2">
	<div
		class="flex flex-nowrap justify-start items-start rounded-sm gap-1 p-2 bg-[hsla(from_var(--surface-8)_h_s_l_/0.1)] text-on-primary animated-slide-in"
	>
		<div
			class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap gap-1"
		>
			{#if isEdit}
				<textarea
					name="adjust-answer"
					bind:value={answer}
					class="w-[500px] max-w-full h-[min(450px,30vh)] flex flex-col flex-nowrap p-4 bg-transparent rounded-xl rounded-bl-none whitespace-pre-wrap resize-none overflow-x-hidden overflow-y-auto scroll-bar"
					bind:this={textEditor}
				></textarea>
			{:else}
				<div class="w-full text-left markdown">
					<SvelteMarkdown source={message.message_object.display} renderers={{ link: Link }}
					></SvelteMarkdown>
				</div>
			{/if}
			<div class="w-full flex flex-nowrap justify-end gap-2">
				{#if isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						aria-label="Cancel My Changes"
						on:click={() => {
							setEdit(false);
						}}
					>
						<Icon icon={IconsEnum.CANCEL_CHANGE}></Icon>
					</button>
				{:else}
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
				{#if !isMarkAnswer}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={setAnswer}
						aria-label="Mark My Answer"
					>
						<Icon icon={IconsEnum.MARK_ON}></Icon>
					</button>
				{/if}
				{#if isMarkAnswer && isEdit}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={setAnswer}
						aria-label="Save My Changes"
					>
						<Icon icon={IconsEnum.SAVE}></Icon>
					</button>
				{/if}
				{#if isMarkAnswer}
					<button
						class="btn-icon action-btn text-xl text-primary bg-surface-5 rounded-full p-1 flex justify-center items-center"
						aria-label="Your Answer | Click to remove your answer"
						on:click={removeAnswer}
					>
						<Icon icon={IconsEnum.CHECK}></Icon>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
