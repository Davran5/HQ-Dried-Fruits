import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MediaContextType {
    images: string[];
    uploadMedia: (file: File) => Promise<string>; // Returns the backend URL string
    deleteMedia: (url: string) => Promise<void>;
    isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchImages = async () => {
        try {
            const res = await fetch("/api/uploads");
            if (!res.ok) throw new Error("Failed to fetch uploads");
            const data = await res.json();
            setImages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load /api/uploads", err);
            setImages([]); // Always fallback to empty string array
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);    const uploadMedia = async (file: File): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Backend rejected file upload request.");
                }

                const data = await response.json();
                await fetchImages(); // Silently refresh the UI
                resolve(data.url); // Returns the actual public path: e.g. /uploads/1234-image.jpg
            } catch (error) {
                console.error("Direct API Upload Process Failed:", error);
                reject(error);
            }
        });
    };

    const deleteMedia = async (url: string) => {
        if (window.confirm("Are you sure you want to permanently delete this file?")) {
            try {
                const response = await fetch("/api/media/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url })
                });

                if (response.ok) {
                    await fetchImages();
                } else {
                    alert("Failed to delete the file on server.");
                }
            } catch (error) {
                console.error("Delete Media Error:", error);
                alert("Network error while trying to delete.");
            }
        }
    };

    return (
        <MediaContext.Provider value={{ images, uploadMedia, deleteMedia, isLoading }}>
            {children}
        </MediaContext.Provider>
    );
}

export function useMedia() {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error("useMedia must be used within a MediaProvider");
    }
    return context;
}
