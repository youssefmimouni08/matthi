import { writable, type Writable } from 'svelte/store';

export enum BusEvents {
	NEXT_QUESTION = 'next_question',
	OPEN_REVIEW = 'open_review',
}

const events: Map<BusEvents, Writable<Array<object>>> = new Map();

export function useBusEvent() {
	function bus(event: BusEvents) {
		if (!events.has(event)) events.set(event, writable([]));
		return events.get(event);
	}

	function dispatch(event: BusEvents, ...args: Array<object>) {
		if (!events.has(event)) events.set(event, writable(args));
		else {
			events.get(event)?.set(args);
		}
	}

	return {
		bus,
		dispatch
	};
}
