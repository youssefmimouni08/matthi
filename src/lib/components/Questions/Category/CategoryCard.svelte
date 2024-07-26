<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Question } from '../../../../ambient';
	import { browser } from '$app/environment';
	import { getActiveQuestion } from '$lib/stores/activeQuestion.store';
	import { onMount } from 'svelte';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import { IconsEnum } from '$lib/constants';
	import { getCurrentQuestion } from '$lib/stores/currentQuestion.store';

	export let questions: Array<Question> = [];
	export let name: string = '';
	export let staticCategories: Array<string> = [];

	const activeQuestion = getActiveQuestion();
	const currentQuestion = getCurrentQuestion();
	let activeQuestionUnsubscribe = () => {};
	let currentQuestionUnsubscribe = () => {};

	let filteredQuestions: Array<Question> = [];
	let displayQuestions: Array<Array<Question>> = [];
	let activeQuestionIndex: string | number = '';
	let currentQuestionIndex: string | number = '';

	$: filteredQuestions = questions.filter(
		(x) => !!x && (x.category ?? '').toLowerCase() == name.toLowerCase()
	);

	$: filteredQuestions, (displayQuestions = groupQuestionBySubCategory());

	function groupQuestionBySubCategory() {
		const rs = filteredQuestions.reduce(
			(accumulator, cq) => {
				if (accumulator.length == 0) {
					return [...accumulator, [cq]];
				}
				const fIndex = accumulator.findIndex((x) => x.findIndex((y) => y.group == cq.group) >= 0);

				if (fIndex < 0) {
					return [...accumulator, [cq]];
				}
				accumulator[fIndex] = [...accumulator[fIndex], cq];
				return accumulator;
			},
			[] as Array<Array<Question>>
		);
		return rs;
	}

	let isShowDetails = true;

	const scrollToQuestion = (qId: string | number) => {
		if (browser) {
			isCanScroll = false;
			let openQuestion = false;
			const questionsContainer = document.querySelectorAll(`[data-question-id='${qId}']`);
			if (questionsContainer.length > 0) {
				questionsContainer.forEach((qc) => {
					qc.scrollIntoView({ behavior: 'smooth' });
				});
			}

			const messagesContainer = document.querySelectorAll(`[data-for='${qId}']`);
			if (messagesContainer.length > 0) {
				openQuestion = true;
				const answerContainer = Array.from(messagesContainer).find(
					(mc) => !!mc.getAttribute('data-answer') && Boolean(mc.getAttribute('data-answer'))
				);
				if (answerContainer) {
					answerContainer.scrollIntoView({ behavior: 'instant' });
				} else {
					messagesContainer[0].scrollIntoView({ behavior: 'instant' });
				}
			}
			useBusEvent().dispatch(BusEvents.OPEN_REVIEW, [openQuestion]);
		}
	};

	let isCanScroll = true;
	const scrollToItem = () => {
		if (!isCanScroll) return;
		if (
			browser &&
			filteredQuestions.length > 0 &&
			filteredQuestions.findIndex((x) => x.id == currentQuestionIndex)
		) {
			isCanScroll = false;
			const currQuestion = document.querySelectorAll('[data-current="true"');
			if (currQuestion.length > 0) {
				currQuestion[0].scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
			}
			setTimeout(() => (isCanScroll = true), 2000);
		}
	};

	onMount(() => {
		if (activeQuestion) {
			activeQuestionUnsubscribe = activeQuestion.subscribe((value) => {
				if (value) {
					activeQuestionIndex = value;
				}
			});
		}

		if (currentQuestion) {
			currentQuestionUnsubscribe = currentQuestion.subscribe((value) => {
				if (value) {
					currentQuestionIndex = value;
					scrollToItem();
				}
			});
		}
		return () => {
			activeQuestionUnsubscribe();
			currentQuestionUnsubscribe();
		};
	});

	const toggleOpenCategory = () => {
		isShowDetails = !isShowDetails;
	};
</script>

<div class="w-full flex flex-col flex-nowrap category-wrapper">
	{#if filteredQuestions.length >= 2 || filteredQuestions.length == 0}
		<button
			class="w-full flex flex-row flex-nowrap justify-start items-center disabled:opacity-15 group category-titlle"
			disabled={filteredQuestions.length <= 0}
			on:click={toggleOpenCategory}
		>
			<div class="flex justify-center items-center transition-opacity w-12 category-icon">
				<div
					class="flex justify-center items-center p-[1px] bg-surface-8 text-primary rounded-full text-xl"
				>
					<Icon icon={IconsEnum.CHECK}></Icon>
				</div>
			</div>

			<span class="flex-1 capitalize text-xl font-semibold text-left px-2 text-surface-8"
				>{name}</span
			>
			<div
				class="flex justify-center items-center p-2 text-3xl text-surface-8 w-12 transition-all {isShowDetails
					? 'rotate-180'
					: 'rotate-0'}"
			>
				<Icon icon={IconsEnum.EXPAND}></Icon>
			</div>
		</button>
	{/if}
	<div
		class="w-full grid category-details grid-rows-[var(--gtc,0fr)] transition-all"
		style="--gtc: {isShowDetails ? 1 : 0}fr"
	>
		<div class="w-full overflow-hidden flex flex-col flex-nowrap">
			{#each displayQuestions as dq}
				{#if dq.length > 1 && !!dq[0].group && dq[0].group.length > 0}
					<div class="w-full flex flex-col flex-nowrap sub-category-wrapper overflow-x-hidden">
						{#if !!dq[0].group && dq[0].group.length > 0}
							<button
								class="w-full flex flex-row flex-nowrap transition-all justify-center items-center group overflow-x-hidden"
								on:click={() => scrollToQuestion(dq[0].id)}
							>
								<div
									class="flex flex-col justify-center items-center px-2 h-full text-on-primary w-12 gap-y-2 sub-category-icon"
								>
									<span class="flex-1 w-[4px] bg-surface-8"></span>
									<div
										class="flex justify-center items-center p-[1px] rounded-full text-sm bg-surface-8 text-primary"
									>
										<Icon icon={IconsEnum.CHECK}></Icon>
									</div>
									<span class="flex-1 w-[4px] bg-surface-8"></span>
								</div>
								<div
									class="flex-1 w-full whitespace-nowrap text-ellipsis capitalize overflow-hidden text-left py-2 border-b-2 border-surface-5 flex flex-row flex-nowrap"
								>
									<span
										class="w-full transition-all group-hover:bg-[hsla(from_var(--surface-5)_h_s_l_/_0.5)] group-hover:shadow-inner group-hover:shadow-[hsla(from_var(--primary)_h_s_l_/_0.1)] p-2 pr-2 rounded-l-sm group-hover text-ellipsis overflow-hidden question__text text-on-primary group-hover:text-primary"
									>
										{dq[0].group}
									</span>
								</div>
							</button>
						{/if}
						{#each dq as fq (fq.id)}
							{#if !staticCategories.includes(fq.category ?? '')}
								<button
									class="w-full flex-row flex-nowrap transition-all justify-center items-center group hidden {!!dq[0]
										.group && dq[0].group.length > 0
										? 'pl-8'
										: ''}"
									on:click={() => scrollToQuestion(fq.id)}
									data-active={fq.id == activeQuestionIndex}
									data-current={fq.id == currentQuestionIndex}
									data-checked-answer={String(fq.userAnswer ?? '').length > 0}
								>
									<div
										class="flex flex-col justify-center items-center px-2 h-full text-on-primary w-12 gap-y-1 {String(
											fq.userAnswer ?? ''
										).length > 0
											? 'opacity-100'
											: 'opacity-20'} transition-opacity"
									>
										<span class="flex-1 w-[4px] bg-surface-8"></span>
										<div
											class="flex justify-center items-center p-[1px] rounded-full bg-surface-8 text-sm"
										>
											<Icon icon={IconsEnum.CHECK} class="text-primary"></Icon>
										</div>
										<span class="flex-1 w-[4px] bg-surface-8"></span>
									</div>
									<div
										class="flex-1 w-full whitespace-nowrap text-ellipsis capitalize overflow-hidden text-left py-2 border-b-2 border-surface-5 flex flex-row flex-nowrap"
									>
										<span
											class="w-full transition-all group-hover:bg-[hsla(from_var(--surface-5)_h_s_l_/_0.5)] group-hover:shadow-inner group-hover:shadow-[hsla(from_var(--primary)_h_s_l_/_0.1)] p-2 pr-2 rounded-l-sm group-hover text-ellipsis overflow-hidden question__text text-on-primary group-hover:text-primary"
										>
											{fq.question_text}
										</span>
									</div>
								</button>
							{:else}
								<button
									class="w-full flex flex-row flex-nowrap justify-start items-center disabled:opacity-15 group"
									on:click={() => scrollToQuestion(fq.id)}
									data-active={fq.id == activeQuestionIndex}
									data-current={fq.id == currentQuestionIndex}
								>
									<div
										class="flex justify-center items-center p-2 text-3xl text-surface-8 transition-opacity w-12"
									>
										<Icon icon={IconsEnum.STAR}></Icon>
									</div>
									<span
										class="flex-1 capitalize text-xl font-semibold text-left px-2 text-surface-8"
										>{name}</span
									>
								</button>
							{/if}
						{/each}
					</div>
				{:else}
					{#each dq as fq (fq.id)}
						{#if !staticCategories.includes(String(fq.category))}
							<button
								class="w-full flex flex-row flex-nowrap transition-all justify-center items-center group"
								on:click={() => scrollToQuestion(fq.id)}
								data-active={fq.id == activeQuestionIndex}
								data-current={fq.id == currentQuestionIndex}
								data-checked-answer={String(fq.userAnswer ?? '').length > 0}
							>
								<div
									class="flex flex-col justify-center items-center px-2 h-full text-on-primary w-12 gap-y-1 {String(fq.userAnswer ?? '').length > 0
										? 'opacity-100'
										: 'opacity-20'} transition-opacity"
								>
									<span class="flex-1 w-[4px] bg-surface-8"></span>
									<div
										class="flex justify-center items-center p-[1px] rounded-full bg-surface-8 text-sm"
									>
										<Icon icon={IconsEnum.CHECK} class="text-primary"></Icon>
									</div>
									<span class="flex-1 w-[4px] bg-surface-8"></span>
								</div>
								<div
									class="flex-1 w-full whitespace-nowrap text-ellipsis capitalize overflow-hidden text-left py-2 border-b-2 border-surface-5 flex flex-row flex-nowrap"
								>
									<span
										class="w-full transition-all group-hover:bg-[hsla(from_var(--surface-5)_h_s_l_/_0.5)] group-hover:shadow-inner group-hover:shadow-[hsla(from_var(--primary)_h_s_l_/_0.1)] p-2 pr-2 rounded-l-sm group-hover text-ellipsis overflow-hidden question__text text-on-primary group-hover:text-primary"
									>
										{String(fq.group ?? '').length > 0 ? fq.group : fq.question_text}
									</span>
								</div>
							</button>
						{:else}
							<button
								class="w-full flex flex-row flex-nowrap justify-start items-center disabled:opacity-15 group"
								on:click={() => scrollToQuestion(fq.id)}
								data-active={fq.id == activeQuestionIndex}
								data-current={fq.id == currentQuestionIndex}
							>
								<div class="flex justify-center items-center transition-opacity w-12">
									<div
										class="flex justify-center items-center p-[1px] bg-surface-8 text-primary rounded-full text-xl"
									>
										<Icon icon={IconsEnum.CHECK}></Icon>
									</div>
								</div>
								<span class="flex-1 capitalize text-xl font-semibold text-left px-2 text-surface-8"
									>{name}</span
								>
							</button>
						{/if}
					{/each}
				{/if}
			{/each}
		</div>
	</div>
</div>

<style lang="postcss">
	[data-active='true'] .question__text {
		@apply bg-[hsla(from_var(--surface-5)_h_s_l_/_0.95)] text-primary;
	}

	[data-current='true'] .question__text {
		@apply bg-[hsla(from_var(--surface-5)_h_s_l_/_0.6)] text-primary;
	}

	.category-wrapper:has([data-checked-answer='false']) .category-icon {
		@apply opacity-15;
	}
	.sub-category-wrapper:has([data-checked-answer='false']) .sub-category-icon {
		@apply opacity-15;
	}
</style>
