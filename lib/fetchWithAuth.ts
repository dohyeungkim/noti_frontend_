export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const res = await fetch(input, init)

	if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/auth") {
		window.location.href = "/auth"
	}

	return res
}
