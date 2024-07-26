<script lang="ts">
	import type { Message } from '../../../../../ambient';
	export let message: Message = {} as Message;
</script>

<div class="w-[min(750px,100%)] flex justify-end items-end py-2">
	<div
		class="flex flex-nowrap justify-start items-start rounded-sm gap-4 p-4 bg-[hsla(from_var(--surface-8)_h_s_l_/0.1)] text-on-primary"
	>
		<div
			class="flex-1 flex flex-col flex-nowrap rounded-xl rounded-bl-none whitespace-pre-wrap gap-4"
		>
			<span class="w-full text-left">
				{message.display}
			</span>
		</div>
	</div>
</div>
