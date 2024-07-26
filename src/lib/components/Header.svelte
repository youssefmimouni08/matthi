<script lang="ts">
	import Logo from '$lib/assets/images/logo.png?url';
	import { IconsEnum } from '$lib/constants';
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';

	let openMenu = false;

	const setOpenMenu = (open: boolean) => {
		openMenu = open;
	};
</script>

{#if openMenu}
	<div
		class="fixed top-0 left-0 z-50 w-screen h-full menu-background hidden max-[920px]:flex flex-col flex-nowrap justify-center items-center text-primary p-4 backdrop-blur-xl"
		transition:slide={{ axis: 'x' }}
	>
		<div class="w-full flex flex-row flex-nowrap justify-end items-center">
			<button on:click={() => setOpenMenu(false)}>
				<Icon icon={IconsEnum.CLOSE} class="text-3xl"></Icon>
			</button>
		</div>
		<div
			class="w-[min(450px,100%)] flex-1 flex flex-col flex-nowrap justify-start items-start gap-4 overflow-x-hidden overflow-y-auto no-scroll-bar"
		>
			<span class="w-full text-center text-3xl font-semibold">About</span>
			<span class="w-full text-center text-3xl font-semibold">Programmes</span>
			<span class="w-full text-center text-3xl font-semibold">Events</span>
			<span class="w-full text-center text-3xl font-semibold">Knowledge Hub</span>
			<span class="w-full text-center text-3xl font-semibold">News</span>
			<span class="w-full text-center text-3xl font-semibold">Join the Community</span>
			<span class="w-full text-center text-3xl font-semibold">Contact</span>
		</div>
	</div>
{/if}
<div
	class="w-full flex flex-nowrap justify-start items-center bg-primary text-on-primary p-4 gap-x-4"
>
	<img src={Logo} alt="logo" class="h-16 logo" />
	<div class="flex-1 hidden flex-row flex-nowrap justify-end items-center max-[920px]:flex">
		<button on:click={() => setOpenMenu(true)}>
			<Icon icon={IconsEnum.MENU} class="text-3xl text-on-surface-5"></Icon>
		</button>
	</div>
	<div
		class="flex-1 flex flex-row flex-nowrap justify-center items-center gap-x-4 max-[920px]:hidden"
	>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">About</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">Programmes</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">Events</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">Knowledge Hub</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">News</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span class="group-hover:text-surface-7">Join the Community</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
		<div class="flex flex-col flex-nowrap justify-start items-start group cursor-pointer">
			<span>Contact</span>
			<span class="w-0 h-1 bg-surface-8 group-hover:w-full transition-all"></span>
		</div>
	</div>
	<div
		class="flex flex-row flex-nowrap justify-start items-center gap-x-1 text-on-surface-5 hover:opacity-50 transition-all"
	>
		<Icon icon={IconsEnum.GLOBE} class="text-2xl"></Icon>
		<span>عربي</span>
	</div>
</div>
<div
	class="w-full bg-surface-8 text-primary flex flex-col flex-nowrap justify-start items-start px-4 py-2 gap-2"
>
	<div class="flex flex-row flex-wrap justify-start items-center font-semibold max-[900px]:hidden">
		<span class="hover:text-on-surface-7 cursor-pointer">Home</span>
		<Icon icon={IconsEnum.EXPAND} class="transform rotate-90 text-xl"></Icon>
		<span class="hover:text-on-surface-7 cursor-pointer">Programmes</span>
		<Icon icon={IconsEnum.EXPAND} class="transform rotate-90 text-xl"></Icon>
		<span class="hover:text-on-surface-7 cursor-pointer">Business in Dubai</span>
		<Icon icon={IconsEnum.EXPAND} class="transform rotate-90 text-xl"></Icon>
		<span class="select-none pointer-events-none opacity-60"
			>Business in Dubai - Application Form</span
		>
	</div>
	<h1 class="w-full font-bold text-lg uppercase min-[1200px]:text-2xl">
		Business in Dubai - Application form
	</h1>
</div>

<style lang="postcss">
	.menu-background {
		background-color: hsla(from var(--surface-5) h s l / 0.7);
	}
</style>
