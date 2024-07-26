<script lang="ts">
	import type { Question } from '../../../ambient';
	import { CategoryTypes, QuestionTypes } from '$lib/constants';
	import FreeText from './QuestionType/FreeText.svelte';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import type { Writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import Email from './QuestionType/Email.svelte';
	import EmailVerification from './QuestionType/EmailVerification.svelte';
	import PitchDeck from './QuestionType/PitchDeck.svelte';
	import Dropdown from './QuestionType/Dropdown.svelte';
	import Options from './QuestionType/Options.svelte';
	import Phone from './QuestionType/Phone.svelte';
	import Website from './QuestionType/Website.svelte';
	import Check from './QuestionType/Check.svelte';
	import { getApplicationStore } from '$lib/stores/application.store';
	import { getCurrentQuestion } from '$lib/stores/currentQuestion.store';

	const applicationStore = getApplicationStore();

	let isSubmitted = false;
	let questions: Array<Question> = [];
	const questionsStore: Writable<Array<Question>> = getQuestionsStore();
	const currentQuestion = getCurrentQuestion();

	const components = [
		{ type: QuestionTypes.TEXT, component: FreeText },
		{ type: QuestionTypes.EMAIL, component: Email },
		{ type: QuestionTypes.EMAIL_VERIFICATION, component: EmailVerification },
		{ type: QuestionTypes.FILE, component: PitchDeck },
		{ type: QuestionTypes.PICK_ONE, component: Dropdown },
		{ type: QuestionTypes.MULTI_OPTIONS, component: Options },
		{ type: QuestionTypes.PHONE, component: Phone },
		{ type: QuestionTypes.COMPANY_DOMAIN, component: Website },
		{ type: QuestionTypes.CHECK, component: Check }
	];

	$: filteredQuestion =
		!!questions && questions.length > 0
			? questions.filter((x) => {
					return (
						!!x &&
						x.category !== CategoryTypes.FEEDBACK &&
						x.category !== CategoryTypes.REVIEW_AND_SUBMISSION &&
						x.category !== CategoryTypes.THANK_YOU
					);
				})
			: [];

	let questionUnsubscribe = () => {};
	let applicationUnsubscribe = () => {};

	const setCurrentQuestionIndex = (index: string | number | null) => {
		if (!index || index == $currentQuestion) return;
		currentQuestion.update(() => index);
	};

	onMount(() => {
		questionUnsubscribe = questionsStore.subscribe((value) => {
			questions = [...value];
		});

		if (!!applicationStore) {
			applicationUnsubscribe = applicationStore.subscribe((value) => {
				isSubmitted = value.isSubmitted;
			});
		}

		return () => {
			questionUnsubscribe();
		};
	});
</script>

{#if questions.length > 0}
	<div
		class="w-full flex-1 flex justify-start items-start flex-col flex-nowrap relative overflow-x-hidden overflow-y-auto no-scroll-bar scroll-smooth overscroll-y-contain text-on-primary"
	>
		<slot></slot>
		<div class="w-full flex-1 flex-col flex-nowrap justify-start items-start self-center">
			{#each filteredQuestion as question (question.id)}
				{@const component =
					components.find((x) => x.type.toLowerCase() == question.type.toLowerCase())?.component ??
					FreeText}
				<div
					class="w-full flex flex-nowrap justify-center items-center"
					on:mouseenter={() => setCurrentQuestionIndex(question.id)}
					on:touchstart={() => setCurrentQuestionIndex(question.id)}
					role="button"
					tabindex="0"
				>
					<div
						class="w-[min(750px,100%)] flex flex-col flex-nowrap cursor-default justify-start items-start overflow-x-hidden overflow-y-auto no-scroll-bar p-4 gap-2"
						data-question-id={question.id}
						data-submitted={isSubmitted}
					>
						{#if !!component}
							<svelte:component this={component} {question}></svelte:component>
						{/if}
						<span
							class="w-full self-center h-[4px] rounded-full bg-[hsla(from_var(--surface-5)_h_s_l_/_0.8)]"
						></span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style lang="postcss">
	[data-submitted='true'] :global(.action-btn) {
		@apply !hidden !pointer-events-none !select-none !opacity-0;
	}
</style>
