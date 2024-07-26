<script>
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
</script>

<div class="w-full flex flex-col flex-nowrap justify-center items-center px-1">
	<div
		class="w-[min(750px,100%)] flex flex-row flex-nowrap justify-start items-center rounded-sm p-4 pb-0 msg gap-4 text-on-primary"
	>
		<div
			class="w-12 aspect-square rounded-full text-surface-8 flex justify-center items-center p-1 ai-icon"
		>
			<Icon icon={IconsEnum.ROBOT} class="text-3xl"></Icon>
		</div>

		<div class="flex flex-1 flex-row flex-nowrap justify-start items-center gap-2">
			<div class="dot" style="--delay:300ms"></div>
			<div class="dot" style="--delay:600ms"></div>
			<div class="dot" style="--delay:900ms"></div>
		</div>
	</div>
</div>

<style lang="postcss">
	.dot {
		@apply w-2 aspect-square rounded-full bg-surface-8;
		animation: pulse 1.8s infinite;
		animation-delay: var(--delay, 0);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 0.2;
		}
	}
</style>
