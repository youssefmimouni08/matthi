<script>
	export let text = '';

	const decodedString = () => {
		const s1 = text.replace(/&amp;/g, '&');
		return s1.replace(/&#x([\da-fA-F]+);|&#(\d+);/g, (match, hex, dec) => {
			return String.fromCharCode(hex ? parseInt(hex, 16) : parseInt(dec, 10));
		});
	};
</script>

<span>{decodedString()}</span>
