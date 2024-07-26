export const getHighlightText = (text: string, matchStr: string) => {
	const arr: Array<string> = [];
	if (matchStr === '') {
		arr.push(text);
		arr.push('');
		arr.push('');
	} else {
		const matchIndexStart = text.toLocaleLowerCase().indexOf(matchStr.toLowerCase()) ?? -1;
		if (matchIndexStart < 0) {
			arr.push(text);
			arr.push('');
			arr.push('');
		} else {
			const matchIndexEnd = matchStr.length + matchIndexStart;
			const head = text.slice(0, matchIndexStart);
			const match = text.slice(matchIndexStart, matchIndexEnd);
			const tail = text.slice(matchIndexEnd, text.length);
			arr.push(head);
			arr.push(match);
			arr.push(tail);
		}
	}
	return arr;
};
