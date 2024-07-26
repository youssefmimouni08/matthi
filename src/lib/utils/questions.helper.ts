import { useQuestionsStore } from '$lib/stores/questions.store';
import type { Program, Question } from '../../ambient';

let questions: Array<Question> = [];

const questionStore = useQuestionsStore();
export function questionBuilder() {
	function init(program: Program) {
		const category = program.category;
		const rs = category
			.map((x) => {
				const group = x.group;
				const categoryName = x.category_name;
				return Object.assign(
					group.map((y) => {
						const groupName = y.display_text;
						return y.question.map((z) =>
							Object.assign(z, { group: groupName, category: categoryName })
						);
					})
				);
			})
			.flat(Infinity)
			.sort((a, b) => (a.order < b.order ? -1 : 1));
		questions = rs;
	}

	function setUserAnswer(qId: string, answer: string) {
		return questionStore.setUserAnswer(qId, answer);
	}

	function getQuestion() {
		return questions;
	}

	return {
		init,
		getQuestion,
		setUserAnswer
	};
}
