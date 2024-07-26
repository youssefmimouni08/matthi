<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { Program, Question } from '../../../ambient';
	import CategoryCard from './Category/CategoryCard.svelte';
	import { getQuestionsStore } from '$lib/stores/questions.store';
	import { onMount } from 'svelte';

	export let program: Program;

	let categories = program?.category ?? [];
	$: categories = (program?.category ?? []).filter(x => x.show_by_start);

	let staticCategories: Array<string> = [];
	$: staticCategories = (program?.category ?? []).filter(x => x.is_static).map(x => x.category_name);

	let questions: Array<Question> = [];
	const questionsStore: Writable<Array<Question>> = getQuestionsStore();

	let questionUnsubscribe = () => {};
	onMount(() => {
		questionUnsubscribe = questionsStore.subscribe((value) => {
			questions = [...value];
		});
		return () => questionUnsubscribe();
	});
</script>

<div
	class="w-full flex flex-col flex-nowrap justify-start items-start h-full overflow-x-hidden overflow-y-auto no-scroll-bar scroll-smooth overscroll-contain"
>
	{#each categories.sort((a, b) => (a.order < b.order ? -1 : 1)) as c}
		<CategoryCard {questions} {staticCategories} name={c.category_name}></CategoryCard>
	{/each}
</div>
