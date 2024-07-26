import { SUPABASE_SERVICE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ locals: { session, supabase }, request }) => {
	try {
		if (!session) throw new Error('unauthorized');
		const userId = session.user?.id ?? '';
		if (userId == '') {
			throw new Error('unauthorized');
		}

		const { data: profile, error: selectProfileError } = await supabase
			.from('profile')
			.select('id')
			.eq('id', userId)
			.maybeSingle();
		if (selectProfileError) {
			throw new Error('could not select profile');
		}
		if (!profile) {
			const { error: createProfileError } = await supabase
				.from('profile')
				.insert({ id: session.user.id });
			if (createProfileError) {
				throw new Error('could not create profile');
			}
		}

		const formData = await request.formData();
		const pitchDeck = formData.get('pitchDeck');
		const website = formData.get('website');
		const programId = formData.get('programId');

		console.log('website', website);
		console.log('programId', programId);
		console.log('pitchDeck', pitchDeck);
		let pitchDeckURL = '';

		if (!!pitchDeck && pitchDeck.type) {
			console.log("running here");
			const fileName = `pitch_deck/${userId}.${new Date().getTime()}.${pitchDeck.type.split('/')[1]}`;
			const serviceRole = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);
			const { error: uploadError } = await serviceRole.storage
				.from('document')
				.upload(fileName, pitchDeck, {
					cacheControl: '3600',
					upsert: true
				});
			if (uploadError) {
				console.log('uploadError', uploadError);
				throw new Error('could not upload Pitch Deck');
			}

			pitchDeckURL = `/document/${fileName}`;
		}

		const { data: application, error: createApplicationError } = await supabase
			.from('application')
			.insert({
				profile_id: session.user.id,
				program_id: programId,
				pitch_deck_url: pitchDeckURL,
				domain: website
			})
			.select('id,profile_id,pitch_deck_url,domain')
			.single();
		if (createApplicationError || !application || !application?.id) {
			throw new Error(createApplicationError.message);
		}

		return json(application);
	} catch (err) {
		console.log('create application error', err);
		error(401, 'Could not create application');
	}
};
