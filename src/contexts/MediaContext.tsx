import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface MediaFile {
    url: string;
    name: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
    aspectRatio?: string;
}

interface MediaContextType {
    images: string[];
    media: MediaFile[];
    uploadMedia: (file: File) => Promise<string>;
    deleteMedia: (url: string) => Promise<void>;
    renameMedia: (url: string, name: string) => Promise<MediaFile>;
    refreshMedia: () => Promise<void>;
    isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

function inferMediaType(url: string) {
    if (/\.(jpe?g|png|webp|gif|svg)$/i.test(url)) return "image/*";
    if (/\.pdf$/i.test(url)) return "application/pdf";
    return "application/octet-stream";
}

export function MediaProvider({ children }: { children: ReactNode }) {
    const [images, setImages] = useState<string[]>([]);
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const normalizeMediaFile = (item: unknown): MediaFile | null => {
        if (typeof item === "string") {
            const name = item.split("/").pop() || "File";
            return { url: item, name, type: inferMediaType(item), size: 0 };
        }

        if (!item || typeof item !== "object") {
            return null;
        }

        const source = item as Partial<MediaFile>;
        if (!source.url) {
            return null;
        }

        const name = source.name || source.url.split("/").pop() || "File";
        return {
            url: source.url,
            name,
            type: source.type || inferMediaType(source.url),
            size: Number.isFinite(Number(source.size)) ? Number(source.size) : 0,
            width: Number.isFinite(Number(source.width)) ? Number(source.width) : undefined,
            height: Number.isFinite(Number(source.height)) ? Number(source.height) : undefined,
            aspectRatio: source.aspectRatio,
        };
    };

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/uploads");
            if (!res.ok) throw new Error("Failed to fetch uploads");
            const data = await res.json();
            const nextMedia = Array.isArray(data) ? data.map(normalizeMediaFile).filter(Boolean) as MediaFile[] : [];
            setMedia(nextMedia);
            setImages(nextMedia.filter((item) => item.type.startsWith("image/")).map((item) => item.url));
        } catch (err) {
            console.error("Failed to load /api/uploads", err);
            setMedia([]);
            setImages([]);
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
                const response = await fetch(file.type.startsWith("image/") ? "/api/upload" : "/api/upload-document", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Backend rejected file upload request.");
                }

                const data = await response.json();
                await fetchImages();
                resolve(data.url);
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

    const renameMedia = async (url: string, name: string) => {
        const response = await fetch("/api/media/rename", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, name }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.error || "Failed to rename the file.");
        }

        await fetchImages();
        return data.file as MediaFile;
    };

    return (
        <MediaContext.Provider value={{ images, media, uploadMedia, deleteMedia, renameMedia, refreshMedia: fetchImages, isLoading }}>
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
