<script lang="ts">
	import { browser } from '$app/environment';
	import Category from '$lib/components/Questions/Category.svelte';
	import Chat from '$lib/components/Questions/Chat.svelte';
	import Questions from '$lib/components/Questions/Questions.svelte';
	import { IconsEnum, QuestionTypes } from '$lib/constants';
	import { getActiveQuestion, useActiveQuestion } from '$lib/stores/activeQuestion.store';
	import { getApplicationStore, useApplicationStore } from '$lib/stores/application.store';
	import { BusEvents, useBusEvent } from '$lib/stores/bus.store';
	import { useCurrentQuestion } from '$lib/stores/currentQuestion.store';
	import { getMessageStore, useMessagesStore } from '$lib/stores/messages.store.js';
	import { getQuestionsStore, useQuestionsStore } from '$lib/stores/questions.store';
	import { questionBuilder } from '$lib/utils/questions.helper';
	import Icon from '@iconify/svelte';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Message } from '../ambient.js';
	import TypingMessage from '$lib/components/Questions/Chat/ChatMessages/TypingMessage.svelte';

	export let data;
	$: ({ program, session, supabase } = data);

	useQuestionsStore().setQuestionStore();
	useApplicationStore().setApplicationStore();
	useActiveQuestion().setActiveQuestion();
	useCurrentQuestion().setCurrentQuestion();
	const useMessages = useMessagesStore([] as Message[]);
	useMessages.setMessageStore();
	const messageStore = getMessageStore();

	const applicationStore = getApplicationStore();
	const questionsStore = getQuestionsStore();
	const activeQuestion = getActiveQuestion();

	const qBuilder = questionBuilder();

	let isShowReview = false;
	let isShowMenu = false;

	let isStartApplication = false;
	let applicationContainer: HTMLDivElement;
	let isSubmitted = false;
	let website = '';
	let isLoading = false;
	let isTyping = true;

	const { bus } = useBusEvent();

	let fileName = '';
	let fileURL = '';
	let isPreviewFile = false;
	let file: File;

	const setOpenPreviewFile = (open: boolean) => {
		if (open && fileURL.length == 0) return;
		isPreviewFile = open;
	};

	const handleUploadFile = (event) => {
		const files = (event.target as HTMLInputElement).files;
		if (browser && !!files && files.length > 0) {
			file = files[0];
			fileURL = URL.createObjectURL(file);
			fileName = file.name;
		}
	};

	async function getMessage(isAnalysis: boolean = false) {
		await fetch('/messages', {
			method: 'post',
			body: JSON.stringify({
				applicationId: $applicationStore.id,
				analysis: isAnalysis
			})
		});
	}

	const startApplication = async () => {
		isLoading = true;
		const formData = new FormData();
		formData.append('pitchDeck', file);
		formData.append('website', website);
		formData.append('programId', program.id);
		const application = await fetch('/application', {
			method: 'POST',
			body: formData
		}).then((res) => res.json());
		if (!application || !application.id) return;
		console.log('application', application);

		applicationStore.update((x) =>
			Object.assign(x, {
				id: application.id,
				program_id: program.id,
				profile_id: session?.user?.id ?? '',
				pitchDeskUrl: application.pitch_deck_url ?? '',
				domain: application.domain ?? '',
				is_finish_analysis_data: application.pitch_deck_url == '' && application.domain == ''
			})
		);
		const { data: userMessages, error: fetchMessagesError } = await supabase
			.from('chat_message')
			.select('*')
			.eq('application_id', application.id);

		if (userMessages?.length == 0 || fetchMessagesError) {
			await getMessage(
				String(application.pitch_deck_url ?? '').length > 0 ||
					String(application.domain ?? '').length > 0
			);
		} else {
			messageStore.update((x) => [...x, ...userMessages]);
		}
		isStartApplication = true;
		isLoading = false;
		if (browser && applicationContainer) {
			applicationContainer.scrollIntoView({ behavior: 'instant' });
		}
	};

	$: isShowChat = !isShowMenu && !isShowReview;
	const showReview = () => {
		isShowReview = true;
		isShowMenu = false;
	};

	const showChat = () => {
		isShowReview = false;
		isShowMenu = false;
	};

	const showMenu = () => {
		isShowMenu = true;
		isShowReview = false;
	};

	let openReviewUnsubscribe = () => {};
	let nextQuestionUnsubscribe = () => {};
	let applicationUnsubscribe = () => {};
	let scrollToBottom = () => {};

	onMount(() => {
		const openReviewBus = bus(BusEvents.OPEN_REVIEW);
		const nextQuestionBus = bus(BusEvents.NEXT_QUESTION);
		qBuilder.init(program);
		questionsStore.set(qBuilder.getQuestion());
		if (!!openReviewBus) {
			openReviewUnsubscribe = openReviewBus.subscribe((value) => {
				if (!value || value.length == 0) return;
				const [openSetting] = value;

				if ((openSetting as Array<boolean>)[0] ?? false) {
					if (isShowReview) return;
					isShowMenu = false;
					isShowReview = false;
				} else {
					isShowMenu = false;
					isShowReview = true;
				}
			});
		}

		if (!!nextQuestionBus) {
			nextQuestionUnsubscribe = nextQuestionBus.subscribe((value) => {
				if (!value || value.length == 0) return;
				const [getNext] = value;
				if ((getNext as Array<boolean>)[0] ?? false) {
					isTyping = true;
					getMessage();
				}
			});
		}
		if (!!applicationStore) {
			applicationUnsubscribe = applicationStore.subscribe((value) => {
				isSubmitted = value.isSubmitted;
			});
		}

		supabase
			.channel('messages')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'chat_message' },
				async (payload) => {
					console.log('payload', payload);
					if (payload.eventType == 'INSERT') {
						const newMsg = payload.new as Message;
						if (newMsg.application_id !== $applicationStore.id) return;
						isLoading = false;
						isTyping = newMsg.is_send;

						if (newMsg.message_object.is_primary) {
							activeQuestion.update(() => newMsg.message_object.question_id);
						}
						messageStore.update((x) => [...x, newMsg as Message]);

						await tick();
						scrollToBottom();
					}
				}
			)
			.subscribe();

		return () => {
			openReviewUnsubscribe();
			applicationUnsubscribe();
		};
	});
</script>

{#if fileURL?.length > 0 && isPreviewFile}
	<div class="fixed top-0 left-0 w-full h-full flex justify-center items-center p-4 z-50">
		<button
			class="bg-surface-8 p-2 flex flex-col flex-nowrap justify-center items-center rounded-full absolute top-4 right-4 z-50"
			on:click={() => setOpenPreviewFile(false)}
		>
			<Icon icon={IconsEnum.CLOSE}></Icon>
		</button>
		<iframe src={fileURL} frameborder="0" width="100%" height="100%" title="Pitch Desk Preview"
		></iframe>
	</div>
{/if}

{#if isLoading}
	<div
		class="fixed top-0 left-0 w-full h-full flex justify-center items-center p-4 z-50 bg-[hsla(from_var(--on-primary)_h_s_l_/0.2)] backdrop-blur-sm"
	>
		<span class="loader"></span>
	</div>
{/if}

<div
	class="w-full flex flex-col flex-nowrap justify-center items-center overflow-hidden"
	bind:this={applicationContainer}
	data-submitted={isSubmitted}
	data-started={isStartApplication}
>
	<div
		class="w-full h-[100dvh] flex flex-row flex-nowrap justify-start items-start gap-x-4 overflow-hidden"
	>
		{#if isStartApplication}
			<div
				class="w-[min(400px,30%)] h-full flex-col flex-nowrap justify-start items-start text-on-primary overflow-hidden gap-2 pb-8 hidden min-[1000px]:flex"
			>
				<Category {program}></Category>
			</div>
			<div
				class="flex-1 h-full flex flex-col flex-nowrap justify-start items-start overflow-hidden relative"
				transition:fade
			>
				<div
					class="w-full flex flex-row flex-nowrap justify-center items-center relative py-2 overflow-hidden"
				>
					<div
						class="absolute top-0 left-0 h-full flex flex-col flex-nowrap justify-start items-start bg-primary overflow-hidden gap-2 -z-10 {isShowChat
							? 'w-0'
							: 'w-full'} transition-all ease-in-out duration-300"
					></div>
					<div
						class="max-w-full flex flex-row flex-nowrap bg-[hsla(from_var(--surface-8)_h_s_l_/0.1)] text-on-primary"
					>
						<button
							class="flex justify-center items-center font-semibold px-4 py-2"
							data-menu-active={!isShowReview && !isShowMenu}
							on:click={showChat}
						>
							Chat
						</button>
						<button
							class="flex justify-center items-center font-semibold px-4 py-2"
							data-menu-active={isShowReview}
							on:click={showReview}
						>
							Review
						</button>
						<button
							class="flex justify-center items-center font-semibold px-4 py-2 min-[1000px]:hidden"
							data-menu-active={isShowMenu}
							on:click={showMenu}>Process</button
						>
					</div>
				</div>
				<div class="w-full flex-1 flex flex-col flex-nowrap overflow-hidden relative">
					<div
						class="absolute top-0 left-0 h-full flex flex-col flex-nowrap justify-center items-center bg-primary overflow-hidden gap-2 z-50 {isShowReview
							? 'w-full'
							: 'w-0'} transition-all ease-in-out duration-300"
					>
						<Questions></Questions>
					</div>
					<div
						class="absolute top-0 left-0 h-full flex flex-col flex-nowrap justify-start items-start bg-primary backdrop-blur-3xl overflow-hidden gap-2 z-50 {isShowMenu
							? 'w-full'
							: 'w-0'} transition-all ease-in-out duration-300 pb-8 min-[1000px]:hidden"
					>
						<Category {program}></Category>
					</div>
					<Chat bind:scrollToBottom>
						{#if isTyping}
							<TypingMessage></TypingMessage>
						{/if}
					</Chat>
				</div>
			</div>
		{:else}
			<div
				class="flex-1 h-full flex flex-col flex-nowrap justify-center items-center overflow-hidden gap-2 relative"
			>
				<div class="w-full flex flex-col flex-nowrap py-12 pt-4">
					<h2 class="text-2xl font-bold text-center w-full text-balance text-surface-5">
						Thank you for your interest in our Dubai Chamber company building program!
					</h2>
					<div class="w-full flex justify-center items-center py-8 px-2">
						<div
							class="w-[min(950px,100%)] max-w-full overflow-hidden flex flex-row flex-wrap justify-center items-stretch gap-2"
						>
							<label
								for="pitch-deck"
								title="upload pitch deck"
								class="w-[min(400px,100%)] flex flex-col flex-nowrap justify-center items-center bg-[hsla(from_var(--surface-5)_h_s_l_/0.1)] backdrop-blur-lg rounded-lg py-8 px-4 gap-2 cursor-pointer hover:bg-[hsla(from_var(--surface-5)_h_s_l_/0.4)]"
							>
								<input
									type="file"
									class="hidden"
									id="pitch-deck"
									name="pitch-deck"
									accept="application/pdf"
									on:change={handleUploadFile}
								/>
								<span class="text-on-primary text-xl">Click here to upload your pitch deck</span>
								<Icon icon={IconsEnum.PDF} class="text-5xl text-on-primary"></Icon>
								<span class="text-on-primary text-xs">Accepted: PDF. Max. 100MB</span>
								{#if fileName.length > 0}
									<button
										class="self-center max-w-full flex justify-center items-center flex-col flex-nowrap text-on-surface-5 hover:underline"
										title="preview your pitch deck"
										on:click|stopPropagation={() => setOpenPreviewFile(true)}
									>
										Uploaded: {fileName}
									</button>
								{/if}
							</label>
							<div class="flex justify-center items-center">
								<span class="font-bold text-2xl text-surface-5">Or</span>
							</div>
							<div
								class="w-[min(400px,100%)] flex flex-col flex-nowrap justify-center items-center bg-[hsla(from_var(--surface-5)_h_s_l_/0.1)] backdrop-blur-lg rounded-lg py-8 px-4 gap-2 cursor-pointer hover:bg-[hsla(from_var(--surface-5)_h_s_l_/0.4)]"
							>
								<span class="w-[min(400px,100%)] text-on-primary text-xl text-center"
									>Don't have a pitch deck?</span
								>
								<div
									class="w-[min(400px,100%)] flex flex-row flex-nowrap justify-start items-center gap-4 bg-primary text-on-primary px-4 py-2 rounded-2xl border-2 border-surface-5"
								>
									<Icon icon={IconsEnum.WEB} class="text-3xl text-surface-5"></Icon>

									<input
										type="text"
										bind:value={website}
										placeholder="Use your website instead"
										class="flex-1 bg-transparent focus:outline-none active:outline-none text-xl font-semibold"
									/>
								</div>
							</div>
						</div>
					</div>
					<span class="w-full text-on-primary text-sm text-center"
						>Hint: You can streamline the process of filling out the form by customizing the
						prefilled bot answer using information from your pitch deck or website</span
					>
					<button
						class="btn-primary max-w-full !flex-row flex gap-x-4 p-4 hover:opacity-80 group my-4 self-center"
						on:click={startApplication}
					>
						<Icon
							icon={IconsEnum.ROCKET}
							class="text-2xl group-hover:transform group-hover:scale-125 transition-transform"
						></Icon>
						<span>Start my application</span>
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- <Footer></Footer> -->

<style lang="postcss">
	[data-menu-active='true'] {
		@apply !bg-[hsla(from_var(--surface-5)_h_s_l_/0.7)] !text-primary;
	}

	[data-submitted='true'] :global(.action-btn) {
		@apply !hidden !pointer-events-none !select-none;
	}

	[data-started='true'] {
		@apply h-[100dvh] max-h-[100dvh];
	}
</style>
