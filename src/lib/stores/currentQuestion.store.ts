import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { CONTEXT_KEYS } from './stores.keys';

const currentQuestion = writable<string | number | null>(null);

export const useCurrentQuestion = (initialValues?: string | number) => {
	if (initialValues) {
		currentQuestion.set(initialValues);
	}

	const setCurrentQuestion = () => {
		setContext(CONTEXT_KEYS.CURRENT_QUESTION, currentQuestion);
	};

	return {
		setCurrentQuestion,
		...currentQuestion
	};
};

export const getCurrentQuestion = (): Writable<string | number | null> => {
	return getContext(CONTEXT_KEYS.CURRENT_QUESTION);
};
