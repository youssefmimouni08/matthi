import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { CONTEXT_KEYS } from './stores.keys';
import type { Application } from '../../ambient';

const application = writable<Application>({
	hasPitchDesk: false,
	isSubmitted: false,
	pitchDeskUrl: '',
	email: '',
	id: '',
	domain: '',
	program_id: '',
	profile_id: '',
	is_finish_analysis_data: false
});

export const useApplicationStore = () => {
	const setApplicationStore = () => {
		setContext(CONTEXT_KEYS.APPLICATION, application);
	};

	return {
		setApplicationStore,
		...application
	};
};

export const getApplicationStore = (): Writable<Application> => {
	return getContext(CONTEXT_KEYS.APPLICATION);
};
