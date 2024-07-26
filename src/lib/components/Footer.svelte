<script lang="ts">
	import Logo from '$lib/assets/images/logo.png?url';
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
</script>

<div
	class="w-full flex flex-nowrap flex-col justify-start items-start bg-primary text-on-primary p-4 gap-4"
>
	<div
		class="w-full flex flex-row flex-nowrap justify-start items-start max-[1000px]:flex-col max-[1000px]:justify-center max-[1000px]:items-center"
	>
		<img src={Logo} alt="logo" class="h-16 logo" />
	</div>
	<div
		class="w-full flex flex-row flex-nowrap justify-start items-center gap-4 max-[1000px]:flex-col max-[1000px]:justify-center"
	>
		<div class="flex-1 flex flex-row flex-nowrap justify-start">
			<span class="w-full max-[1000px]:text-center"
				>Copyright © 2024 Dubai Chamber of Digital Economy</span
			>
		</div>
		<div class="flex-1 flex flex-row flex-nowrap justify-center items-center gap-2">
			<a href="https://www.facebook.com/DxbChamberDigi/" target="_blank" class="icon"
				><Icon icon={IconsEnum.FACEBOOK}></Icon></a
			>
			<a href="https://www.instagram.com/dxbchamberdigi/" target="_blank" class="icon"
				><Icon icon={IconsEnum.INSTAGRAM}></Icon></a
			>
			<a
				href="https://x.com/i/flow/login?redirect_after_login=%2Fdxbchamberdigi"
				target="_blank"
				class="icon"><Icon icon={IconsEnum.TWITTER}></Icon></a
			>
			<a
				href="https://www.linkedin.com/showcase/dubai-chamber-of-digital-economy/"
				target="_blank"
				class="icon"><Icon icon={IconsEnum.LINKEDIN}></Icon></a
			>
			<a href="https://www.youtube.com/dubaichambertv" target="_blank" class="icon"
				><Icon icon={IconsEnum.YOUTUBE}></Icon></a
			>
		</div>
		<div class="flex-1 flex flex-row flex-nowrap justify-end">
			<span class="w-full text-end max-[1000px]:text-center text-balance"
				>Security and Privacy Policy | Terms and Conditions</span
			>
		</div>
	</div>
</div>

<style lang="postcss">
	.icon {
		@apply flex justify-center items-center p-2 rounded-full bg-surface-8 text-primary text-3xl transition-all;
	}

	.icon:hover {
		@apply bg-surface-7 opacity-90;
	}
</style>
