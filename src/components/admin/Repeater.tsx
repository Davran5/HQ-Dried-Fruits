import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface RepeaterProps<T> {
    label: string;
    items: T[];
    onUpdate: (items: T[]) => void;
    emptyItem: T;
    renderItem: (item: T, index: number, updateItem: (index: number, key: keyof T, value: any) => void, replaceItem: (index: number, value: T) => void) => React.ReactNode;
}

export function Repeater<T>({ label, items, onUpdate, emptyItem, renderItem }: RepeaterProps<T>) {
    const addItem = () => {
        const newItem = typeof emptyItem === 'object' && emptyItem !== null && !Array.isArray(emptyItem)
            ? { ...emptyItem }
            : emptyItem;

        onUpdate([...(items || []), newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onUpdate(newItems);
    };

    const updateItem = (index: number, key: keyof T, value: any) => {
        const newItems = [...items];
        const currentItem = newItems[index];

        if (typeof currentItem === 'object' && currentItem !== null && !Array.isArray(currentItem)) {
            newItems[index] = { ...currentItem, [key]: value };
        } else {            newItems[index] = value as T;
        }

        onUpdate(newItems);
    };

    const replaceItem = (index: number, value: T) => {
        const newItems = [...items];
        newItems[index] = value;
        onUpdate(newItems);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800">{label}</label>
                <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-8 text-xs">
                    <Plus size={14} className="mr-1" /> Add Row
                </Button>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
                        No items added yet.
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={16} />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-white p-1 rounded transition-colors shadow-sm"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="pl-6 pr-8">
                                {renderItem(item, index, updateItem, replaceItem)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
