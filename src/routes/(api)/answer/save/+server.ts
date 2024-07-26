import { error, json } from '@sveltejs/kit';

export const POST = async ({ locals: { session, supabase }, request }) => {
	try {
		if (!session) throw new Error('unauthorized');
		const { answer } = await request.json();
		const insertAnswers: Array<object> = [];
		const updatedAnswers: Array<object> = [];
		const result: Array<object> = [];

		if (Array.isArray(answer)) {
			await Promise.all(
				answer.map(async (a) => {
					const { data: selectedAnswer, error: selectAnswerError } = await supabase
						.from('user_answers')
						.select('id')
						.match({ application_id: a.application_id, question_id: a.question_id })
						.maybeSingle();
					if (selectAnswerError) {
						throw new Error(JSON.stringify(selectAnswerError));
					}
					if (selectedAnswer) {
						updatedAnswers.push(Object.assign(a, { id: selectedAnswer.id }));
					} else {
						insertAnswers.push(a);
					}
				})
			);
		} else {
			insertAnswers.push(answer);
		}

		if (insertAnswers.length > 0) {
			const { data: insertUserAnswer, error: insertAnswerError } = await supabase
				.from('user_answers')
				.insert(answer)
				.select('*');
			if (insertAnswerError || !insertUserAnswer) {
				throw new Error(JSON.stringify(insertAnswerError));
			} else {
				result.push(insertUserAnswer);
			}
		}

		if (updatedAnswers.length > 0) {
			await Promise.all(
				updatedAnswers.map(async (ua) => {
					const { data: updateUserAnswer, error: updateAnswerError } = await supabase
						.from('user_answers')
						.update(ua)
						.eq('id', (ua as { id: string }).id);
					if (updateAnswerError || !updateUserAnswer) {
						throw new Error(JSON.stringify(updateAnswerError));
					}
					result.push(updateUserAnswer);
				})
			);
		}
		return json(result.flat());
	} catch (err) {
		console.log('save user answer', err);
		error(401, 'Could not save user answer');
	}
};
