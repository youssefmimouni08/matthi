<script lang="ts">
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import type { Message } from '../../../../../ambient';
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import Link from '../Markdown/Link.svelte';

	export let message: Message = {} as Message;

	let animatedText = '';
	let isFinishTyping = false;
	onMount(() => {
		const displayWords = message.display.split(' ');
		let wId = 0;
		let INTERVAL_TIME = 50;
		const interVals = setInterval(() => {
			if (wId >= displayWords.length) return;
			animatedText += displayWords[wId] + ' ';
			wId++;
		}, INTERVAL_TIME);
		setTimeout(
			() => {
				clearInterval(interVals);
				isFinishTyping = true;
			},
			INTERVAL_TIME * (displayWords.length + 1)
		);
	});
</script>

<div class="w-full flex flex-col items-center flex-nowrap gap-4">
	<div
		class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-start rounded-sm text-on-primary p-4 msg gap-4"
	>
		<div
			class="w-12 aspect-square rounded-full text-surface-8 flex justify-center items-center p-1"
		>
			<Icon icon={IconsEnum.ROBOT} class="text-3xl"></Icon>
		</div>
		<div class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none gap-4">
			<div class="w-full text-left relative">
				<div class="w-full text-left markdown {isFinishTyping ? 'opacity-100' : 'opacity-0'}">
					<SvelteMarkdown source={message.display} renderers={{ link: Link }}></SvelteMarkdown>
				</div>
				{#if !isFinishTyping}
					<div class="w-full text-left markdown opacity-100 absolute top-0 left-0">
						<SvelteMarkdown source={animatedText} renderers={{ link: Link }}></SvelteMarkdown>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
