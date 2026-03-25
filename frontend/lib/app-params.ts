const isNode = typeof window === 'undefined';
const storage = isNode ? new Map<string, string>() : window.localStorage;

const toSnakeCase = (str: string) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName: string, { defaultValue = undefined, removeFromUrl = false }: { defaultValue?: any, removeFromUrl?: boolean } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	
	const setItem = (key: string, value: string) => {
		if (storage instanceof Map) {
			storage.set(key, value);
		} else {
			storage.setItem(key, value);
		}
	};

	const getItem = (key: string) => {
		if (storage instanceof Map) {
			return storage.get(key);
		} else {
			return storage.getItem(key);
		}
	};

	if (searchParam) {
		setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	return {
		appId: getAppParamValue("app_id", { defaultValue: (import.meta as any).env?.VITE_BASE44_APP_ID }),
		serverUrl: getAppParamValue("server_url", { defaultValue: (import.meta as any).env?.VITE_BASE44_BACKEND_URL }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: typeof window !== 'undefined' ? window.location.href : '' }),
		functionsVersion: getAppParamValue("functions_version"),
	}
}

export const appParams = {
	...getAppParams()
}
