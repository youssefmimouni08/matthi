import { IDEASOUQ_SERVICE_API_ENDPOINT, IDEASOUQ_SERVICE_API_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ locals: { session, supabase }, request }) => {
	try {
		if (!session) throw new Error('unauthorized');
		const { applicationId, analysis, message, questionId } = await request.json();

		if (message) {
			delete message.id;
			const { error: insertMessageError } = await supabase.from('chat_message').insert(message);
			if (insertMessageError) {
				throw new Error(`insert message error: ${JSON.stringify(insertMessageError)}`);
			}
		}
		const header = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'X-API-KEY': IDEASOUQ_SERVICE_API_KEY || ''
		};

		const serviceURL = analysis
			? new URL('api/analyse_data', IDEASOUQ_SERVICE_API_ENDPOINT).href
			: new URL('api/chat', IDEASOUQ_SERVICE_API_ENDPOINT).href;
		console.log(serviceURL);
		const response = await fetch(serviceURL, {
			method: 'POST',
			headers: header,
			body: JSON.stringify({
				application_id: applicationId,
				...(questionId && { question_id: questionId })
			})
		});

		if (!response.ok)
			throw new Error(
				`Unable to connect to  Service (@ ${IDEASOUQ_SERVICE_API_ENDPOINT}) - ${response.statusText}`
			);

		return json({ status: 'ok' });
	} catch (err) {
		console.log('Send message', err);
		error(401, 'Could not send message');
	}
};
