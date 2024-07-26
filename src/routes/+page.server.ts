import { PROGRAM_ID } from '$env/static/private';

export const load = async ({ locals: { supabase, session } }) => {
	if (!session) {
		await supabase.auth.signInAnonymously();
	}
	const { data } = await supabase
		.from('program')
		.select('*,category(*,group(*,question(*)))')
		.eq('id', PROGRAM_ID)
		.single();

	return { program: data, session };
};
