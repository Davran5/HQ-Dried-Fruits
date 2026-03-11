export interface LeadSubmission {
    name?: string;
    company?: string;
    email: string;
    phone?: string;
    telegram?: string;
    productInterest?: string;
    estTonnage?: string;
    message?: string;
}

export async function submitLead(payload: LeadSubmission) {
    const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit inquiry");
    }

    return response.json();
}
