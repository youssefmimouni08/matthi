import { writable, type Writable } from 'svelte/store';
import type { Message } from '../../ambient';
import { getContext, setContext } from 'svelte';
import { CONTEXT_KEYS } from './stores.keys';

const messagesStore = writable<Array<Message>>([]);

export const useMessagesStore = (initialValues?: Array<Message>) => {
	if (initialValues) {
		messagesStore.set(initialValues);
	}

	const setMessageStore = () => {
		setContext(CONTEXT_KEYS.MESSAGES, messagesStore);
	};

	const sendMessage = (msg: Message) => {
		messagesStore.update((x) => [...x, msg]);
	};

	const markAnswer = (qId: number | string, msgId: number | string, answerText: string) => {
		messagesStore.update((x) => {
			const updatedMessages = x.map((y) => {
				if (!!y.for && y.for == qId) {
					y = Object.assign(
						{},
						y,
						{ isAnswer: y.id == msgId },
						{ display: y.id == msgId ? answerText : y.display }
					);
				}
				return y;
			});
			return updatedMessages;
		});
	};

	const markGroupAnswer = (msgId: number | string, answerText: string) => {
		messagesStore.update((x) => {
			const updatedMessages = x.map((y) => {
				if (y.id == msgId) {
					y = Object.assign({}, y, { isAnswer: true }, { display: answerText });
				}
				return y;
			});
			return updatedMessages;
		});
	};

	const removeAnswer = (qId: number | string, msgId: number | string, answerText: string) => {
		messagesStore.update((x) => {
			const updatedMessages = x.map((y) => {
				if (!!y.for && y.for == qId) {
					y = Object.assign(
						{},
						y,
						{ isAnswer: false },
						{ display: y.id == msgId ? answerText : y.display }
					);
				}
				return y;
			});
			return updatedMessages;
		});
	};

	const removeGroupAnswer = (msgId: number | string, answerText: string) => {
		messagesStore.update((x) => {
			const updatedMessages = x.map((y) => {
				if (y.id == msgId) {
					y = Object.assign({}, y, { isAnswer: false }, { display: answerText });
				}

				return y;
			});
			return updatedMessages;
		});
	};

	return {
		setMessageStore,
		sendMessage,
		markAnswer,
		markGroupAnswer,
		removeGroupAnswer,
		removeAnswer,
		...messagesStore
	};
};

export const getMessageStore = (): Writable<Array<Message>> => {
	return getContext(CONTEXT_KEYS.MESSAGES);
};
