<script lang="ts">
	import type { Message } from '../../../../../ambient';
	import FreeText from '../UserChatTypes/FreeText.svelte';
	import PitchDeck from '../UserChatTypes/PitchDeck.svelte';
	import { QuestionTypes } from '$lib/constants';
	import EmailVerification from '../UserChatTypes/EmailVerification.svelte';

	export let message: Message = {} as Message;

	const components = [
		{ name: QuestionTypes.TEXT, component: FreeText },
		{ name: QuestionTypes.FILE, component: PitchDeck },
		{ name: QuestionTypes.EMAIL_VERIFICATION, component: EmailVerification }
	];

	$: component = !message.message_object.type
		? FreeText
		: components.find((x) => x.name == message.message_object.type)?.component ?? FreeText;
</script>

<svelte:component this={component} {message}></svelte:component>
