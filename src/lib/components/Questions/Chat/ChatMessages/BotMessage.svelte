<script lang="ts">
	import { QuestionTypes } from '$lib/constants';

	import type { Message } from '../../../../../ambient';

	import FreeText from '../ChatTypes/FreeText.svelte';
	import EmailVerification from '../ChatTypes/EmailVerification.svelte';
	import PitchDeck from '../ChatTypes/PitchDeck.svelte';
	import Website from '../ChatTypes/Website.svelte';
	import Dropdown from '../ChatTypes/Dropdown.svelte';
	import Options from '../ChatTypes/Options.svelte';
	import Check from '../ChatTypes/Check.svelte';
	import Submit from '../ChatTypes/Submit.svelte';
	import MultiText from '../ChatTypes/MultiText.svelte';

	export let message: Message = {} as Message;

	const components = [
		{ name: QuestionTypes.TEXT, component: FreeText },
		{ name: QuestionTypes.EMAIL_VERIFICATION, component: EmailVerification },
		{ name: QuestionTypes.FILE, component: PitchDeck },
		{ name: QuestionTypes.COMPANY_DOMAIN, component: Website },
		{ name: QuestionTypes.PICK_ONE, component: Dropdown },
		{ name: QuestionTypes.MULTI_OPTIONS, component: Options },
		{ name: QuestionTypes.CHECK, component: Check },
		{ name: QuestionTypes.REVIEW, component: Submit },
		{ name: QuestionTypes.MULTI_TEXT, component: MultiText },
	];

	$: component = !message.message_object.type
		? FreeText
		: components.find((x) => x.name == message.message_object.type)?.component ?? FreeText;
</script>

<svelte:component this={component} {message}></svelte:component>
