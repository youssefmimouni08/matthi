<script lang="ts">
	import type { Question } from '../../../../ambient';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import { questionBuilder } from '$lib/utils/questions.helper';

	export let question: Question = {} as Question;
	let isSuccess = false;
	$: isSuccess = question.isSuccess;
	let isChecked: boolean = false;
	let hasAnswer: boolean = false;
	$: isChecked = Boolean(question.userAnswer);

	$: hasAnswer = String(question.userAnswer).length > 0;
	const qBuilder = questionBuilder();
	const { dispatch } = useBusEvent();

	const saveAnswer = () => {
		const setAnswerRes = qBuilder.setUserAnswer(question.id, isChecked);
		if (setAnswerRes) {
			qBuilder.setQuestionSuccess(question.id);
			question.userAnswer = isChecked;
			isSuccess = true;
		}
	};
</script>

<div
	class="w-full h-full flex flex-col justify-start items-start overflow-hidden relative gap-2"
>
	<div
		class="w-full flex flex-1 flex-col flex-nowrap justify-center items-center overflow-hidden gap-4"
	>
		{#if hasAnswer}
			<div class="flex flex-row flex-nowrap justify-start items-start gap-4 w-full">
				<input
					type="checkbox"
					name="question_check"
					id="question_check"
					on:change={saveAnswer}
					bind:checked={isChecked}
					disabled={!hasAnswer}
					class="w-6 aspect-square cursor-pointer accent-surface-8 action-btn"
				/>
				<label for="question_check" class="text-xl cursor-pointer flex-1">
					{question.question}
				</label>
			</div>
		{:else}
			<span class="text-xl">{question.question}</span>
		{/if}
	</div>
</div>
