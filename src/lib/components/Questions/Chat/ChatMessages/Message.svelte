<script lang="ts">
	import type { Message } from '../../../../../ambient';
	import UserMessage from './UserMessage.svelte';
	import BotMessage from './BotMessage.svelte';

	export let message: Message = {} as Message;

	let isMarkAnswer = message.message_object.is_answer ?? false;
	$: mId = message.id;
	$: qId = message.message_object.question_id ?? '';
	$: isMarkAnswer = message.message_object.is_answer ?? false;
	$: component = !!message && (message.is_send ?? false) ? UserMessage : BotMessage;
</script>

<div
	class="w-full flex flex-col flex-nowrap justify-center items-center px-1"
	data-answer={isMarkAnswer}
	data-for={qId}
	data-msg-id={mId}
>
	<svelte:component this={component} {message}></svelte:component>
</div>

<style lang="postcss">
	[data-answer='true'] {
		@apply bg-[hsla(from_var(--surface-1)_h_s_l_/_0.5)];
	}

	[data-answer='true'] :global(.msg) {
		@apply !bg-[hsla(from_var(--surface-8)_h_s_l_/0.1)];
	}
</style>
