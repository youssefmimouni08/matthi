<script lang="ts">
	import '$lib/assets/css/app.css';
	import Header from '$lib/components/Header.svelte';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div
	class="fixed top-0 left-0 w-screen text-primary fhs overflow-hidden flex flex-col flex-nowrap justify-center items-center"
>
	<div
		class="w-[min(2400px,100%)] h-full overflow-y-auto no-scroll-bar overflow-x-hidden flex justify-start items-start flex-col flex-nowrap"
	>
		<Header></Header>
		<div
			class="w-[min(1600px,100%)] self-center justify-start items-start relative bg-[hsla(from_var(--surface-4)_h_s_l_/_0.05)]"
		>
			<slot />
		</div>
	</div>
</div>
