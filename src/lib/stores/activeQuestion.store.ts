import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { CONTEXT_KEYS } from './stores.keys';

const activeQuestion = writable<string>("");

export const useActiveQuestion = (initialValues?: string) => {
	if (initialValues) {
		activeQuestion.set(initialValues);
	}

	const setActiveQuestion = () => {
		setContext(CONTEXT_KEYS.ACTIVE_QUESTION, activeQuestion);
	};

	return {
		setActiveQuestion,
		...activeQuestion
	};
};

export const getActiveQuestion = (): Writable<string> => {
	return getContext(CONTEXT_KEYS.ACTIVE_QUESTION);
};
