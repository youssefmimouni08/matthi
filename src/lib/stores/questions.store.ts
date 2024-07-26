import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { CONTEXT_KEYS } from './stores.keys';
import type { Question } from '../../ambient';

const questionsStore = writable<Array<Question>>([]);

export const useQuestionsStore = (initialValues?: Array<Question>) => {
	if (initialValues) {
		questionsStore.set(initialValues);
	}

	const setQuestionStore = () => {
		setContext(CONTEXT_KEYS.QUESTIONS, questionsStore);
	};

	const addQuestions = (q: Array<Question>) => {
		questionsStore.update((x) => x.concat(q));
	};

	const setUserAnswer = (qId: string, answer: string) => {
		let isFound = false;
		questionsStore.update((x) => {
			const q = x.find((y) => y.id == qId);
			if (q) {
				isFound = !!q;
				q.userAnswer = answer;
			}
			return x;
		});
		return isFound;
	};

	return {
		setQuestionStore,
		addQuestions,
		setUserAnswer,
		...questionsStore
	};
};

export const getQuestionsStore = (): Writable<Array<Question>> => {
	return getContext(CONTEXT_KEYS.QUESTIONS);
};
