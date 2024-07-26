<script lang="ts">
	import Icon from '@iconify/svelte';
	import codes from '$lib/assets/json/codes.json';
	import { IconsEnum } from '$lib/constants';

	export let telephone = {
		country: 'United States',
		code: '+1',
		iso: 'US'
	};
	export let close = () => {};

	let searchKey = '';
	let filteredCodes = codes;

	const handleKeyDown = (event: KeyboardEvent) => {
		const isEnterPressed = event.key.toLowerCase() === 'enter';
		if (isEnterPressed && searchKey !== '') {
			search();
			return;
		}
		const isEscPressed = event.key.toLowerCase() === 'Escape'.toLowerCase();
		if (isEscPressed && searchKey !== '') {
			searchKey = '';
		}
	};

	$: searchKey,
		(filteredCodes = codes.filter(
			(x) =>
				x.country.toLowerCase().includes(searchKey.toLowerCase()) ||
				x.code.toLowerCase().includes(searchKey.toLowerCase()) ||
				x.iso.toLowerCase().includes(searchKey.toLowerCase())
		));
	const search = () => {
		filteredCodes = codes.filter(
			(x) =>
				x.country.toLowerCase() === searchKey.toLowerCase() ||
				x.code.toLowerCase() === searchKey.toLowerCase() ||
				x.iso.toLowerCase() === searchKey.toLowerCase()
		);
	};
	const setTelephoneCode = (code) => {
		telephone = Object.assign({}, code);
		close();
	};
</script>

<div
	class="w-full border-2 border-surface-5 max-h-full rounded-xl overflow-hidden email-input divide-y divide-surface-5 flex flex-col justify-start items-start flex-nowrap"
>
	<div class="w-full flex flex-row flex-nowrap justify-start items-stretch h-12">
		<input
			type="text"
			bind:value={searchKey}
			class="p-2 flex-1 bg-transparent overflow-hidden placeholder:text-[hsla(from_var(--on-primary)_h_s_l_/_0.9)]"
			placeholder="f.e United State/US/+1"
			name="tel-search"
			on:click|stopPropagation
			on:keydown|stopPropagation={handleKeyDown}
		/>
		<button
			class="flex aspect-square h-full justify-center items-center p-1 text-2xl"
			on:click|stopPropagation={search}
		>
			<Icon icon={IconsEnum.SEARCH}></Icon>
		</button>
	</div>
	<div
		class="flex-1 w-full overflow-x-hidden overflow-y-auto scroll-bar flex flex-col flex-nowrap justify-start items-start divide-y divide-surface-5"
	>
		{#each filteredCodes as code, index (index)}
			<button
				disabled={code.iso === telephone.iso && code.code === telephone.code}
				class="w-full flex flex-row flex-nowrap justify-start items-center overflow-hidden pl-2 py-4 hover:bg-surface-3 hover:text-on-surface-3 text-base gap-x-2 h-10 disabled:opacity-30"
				on:click|stopPropagation={() => setTelephoneCode(code)}
			>
				<Icon icon={`circle-flags:${code.iso.toLowerCase()}`} class="text-2xl"></Icon>
				<span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left font-normal">
					{code.country}
				</span>
				<span>
					{code.code}
				</span>
			</button>
		{/each}
	</div>
</div>
