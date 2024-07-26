<script lang="ts">
	import { IconsEnum, MessageType } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message, Question } from '../../../../../ambient';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { useMessagesStore } from '$lib/stores/messages.store';
	import SvelteMarkdown from 'svelte-markdown';
	import Link from '../Markdown/Link.svelte';
	import { getApplicationStore } from '$lib/stores/application.store';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';

	export let message: Message = {} as Message;

	let question: Question = {} as Question;
	const questionsStore: Writable<Question[]> = getQuestionsStore();
	const { dispatch } = useBusEvent();

	let isEdit: boolean = false;
	let isMarkAnswer: boolean = false;
	let isSuggested: boolean = false;

	let display = getDisplayText();
	let questionData = message.message_object.data ?? [];
	const applicationStore = getApplicationStore();
	const questionFactory = questionBuilder();

	$: message, (display = getDisplayText());
	$: isMarkAnswer = message.message_object.is_answer ?? false;
	$: isSuggested = message.message_object.is_suggested ?? false;
	$: question = !!message.message_object.question_id
		? ($questionsStore.find((x) => x.id == message.message_object.question_id) ?? ({} as Question))
		: ({} as Question);
	$: message,
		(questionData = (message.message_object.data ?? []).map((x) =>
			Object.assign(x, { answer: String(x.answer) })
		));

	function getDisplayText() {
		const dt = (
			message.message_object.messages ?? ([] as Array<{ text: string; type: MessageType }>)
		)
			.map((x) => {
				if (x.type == MessageType.TEXT) return x.text;
				return message.message_object.data
					?.map((y) => {
						const fq = $questionsStore.find((z) => z.id == y.question_id);
						if (!fq) {
							return `- **${y.question_text}**: ${y.answer}`;
						}
						return `- **${String(fq.preview_answer_text ?? '').length > 0 ? fq.preview_answer_text : y.question_text}**: ${y.answer}`;
					})
					.join('\n');
			})
			.join('\n\n');
		return dt;
	}

	const setEdit = async (edit: boolean) => {
		isEdit = edit;
	};

	const setAnswer = async () => {
		const setAnswerResponse = await fetch('/answer/save', {
			method: 'post',
			body: JSON.stringify({
				answer: questionData.map((qd) => {
					return {
						question_id: qd.question_id,
						application_id: $applicationStore.id,
						user_answer: qd.answer
					};
				})
			})
		}).then((res) => res.json());

		if (!$applicationStore.is_finish_analysis_data) {
			applicationStore.update((x) =>
				Object.assign(x, {
					is_finish_analysis_data: true
				})
			);
			dispatch(BusEvents.NEXT_QUESTION, [true]);
		}
		if (Array.isArray(setAnswerResponse)) {
			setAnswerResponse.forEach((qd) => {
				questionFactory.setUserAnswer(qd.question_id, qd.user_answer);
				// questionFactory.setQuestionSuccess(qd.question_id);
				// questionFactory.markAnswer(qd.question_id, message.id, getDisplayText());
				// useMessagesStore().markAnswer(qd.question_id, message.id, getDisplayText());
			});
		}
		useMessagesStore().markGroupAnswer(message.id, getDisplayText());
		isMarkAnswer = true;
		message.message_object.is_answer = true;
		isEdit = false;
	};

	const removeAnswer = async () => {
		questionData.forEach((qd) => {
			// questionFactory.setUserAnswer(qd.question_id, '');
			// questionFactory.setQuestionUnsuccess(qd.question_id);
			// questionFactory.removeAnswer(qd.question_id, message.id, getDisplayText());
			// useMessagesStore().removeAnswer(qd.question_id, message.id, getDisplayText());
		});

		useMessagesStore().removeGroupAnswer(message.id, getDisplayText());
		isMarkAnswer = true;
		isEdit = false;
	};

	let animatedText = '';
	let isFinishTyping = false;

	onMount(() => {
		const displayWords = getDisplayText().split(' ');
		let wId = 0;
		let INTERVAL_TIME = 50;
		const interVals = setInterval(() => {
			if (wId >= displayWords.length) return;
			animatedText += displayWords[wId] + ' ';
			wId++;
		}, INTERVAL_TIME);
		setTimeout(
			() => {
				clearInterval(interVals);
				isFinishTyping = true;
				if (message.message_object.is_suggested) {
					setAnswer();
				}
			},
			INTERVAL_TIME * (displayWords.length + 1)
		);
	});
</script>

<div
	class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm p-4 pb-0 msg gap-4 text-on-primary"
	data-ai-suggestion={isSuggested}
>
	<div
		class="w-12 aspect-square rounded-full text-surface-8 flex justify-center items-center p-1 ai-icon"
	>
		<Icon icon={IconsEnum.ROBOT} class="text-3xl"></Icon>
	</div>

	<div class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap">
		{#if isEdit}
			<div class="w-full text-left relative flex flex-col flex-nowrap">
				{#each message.message_object.messages ?? [] as msg}
					{#if msg.type == MessageType.ANSWER}
						<ul class="list-disc flex flex-col flex-nowrap w-full gap-2">
							{#each questionData as data, i}
								<li class="flex flex-col flex-nowrap justify-start items-start gap-x-2 w-full">
									<span
										>{String(question.preview_answer_text ?? '').length > 0
											? question.preview_answer_text
											: data.question_text}:</span
									>
									<textarea
										bind:value={questionData[i].answer}
										class="flex-1 w-full px-4 h-[80px] bg-[hsla(from_var(--surface-5)_h_s_l_/0.1)] font-semibold max-h-[min(250px,30vh)] overflow-y-auto scroll-bar focus:outline-surface-8 resize-none"
									/>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="w-full text-left markdown">
							<SvelteMarkdown source={msg.text} renderers={{ link: Link }}></SvelteMarkdown>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="w-full text-left relative">
				<div class="w-full text-left markdown {isFinishTyping ? 'opacity-100' : 'opacity-0'}">
					<SvelteMarkdown source={display} renderers={{ link: Link }}></SvelteMarkdown>
				</div>
				{#if !isFinishTyping}
					<div class="w-full text-left markdown opacity-100 absolute top-0 left-0">
						<SvelteMarkdown source={animatedText} renderers={{ link: Link }}></SvelteMarkdown>
					</div>
				{/if}
			</div>
		{/if}
		<div class="w-full flex flex-row flex-nowrap justify-end items-stretch gap-4 py-1">
			{#if isSuggested && isFinishTyping}
				<div class="flex flex-row flex-nowrap flex-1">
					<div
						class=" gap-2 bg-yellow-500 text-black font-semibold rounded-full px-2 py-1 text-xs flex flex-row justify-center flex-nowrap"
					>
						<span>AI Suggestion</span>
					</div>
				</div>
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
				{:else}
					<button
						class="btn-icon p-1 action-btn text-xl"
						on:click={setAnswer}
						aria-label="Mark My Answer"
					>
						<Icon icon={IconsEnum.MARK_ON}></Icon>
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	[data-expand-text='true'] .ai-icon {
		@apply opacity-0;
	}
</style>
