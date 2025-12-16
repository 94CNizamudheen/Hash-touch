
const API_BASE = "https://development.hc.hashtape.com";

export const authService = {
    async loginTenant(params: {
        domain: string;
        email: string;
        password: string;
    }) {
        console.log("LOGIN REQUEST", {
            url: `${API_BASE}/api/${params.domain}/login`,
            email: params.email,
        });
        const res = await fetch(

            `${API_BASE}/api/${params.domain}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    email: params.email,
                    password: params.password,
                }),
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Tenant login failed");
        }

        return res.json();
    },



    saveTenantAuth(token: string, domain: string) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("tenant_domain", domain);
    },
};
