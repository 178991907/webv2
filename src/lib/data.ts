'use server';

import 'server-only';
import { db } from './db';
import * as schema from './schema';
import type { Settings, Category } from './types';
import { eq } from 'drizzle-orm';

// Helper function to handle potential empty results
async function getOrCreateDefaultSettings(): Promise<Settings> {
    // Since there's only one row, we can just select the first one.
    let settingsResult = await db.select().from(schema.settings).limit(1);

    if (settingsResult.length === 0) {
        // If no settings exist, create the default one
        const defaultSettings: Omit<Settings, 'id'> = {
            title: '英语全科启蒙',
            logo: 'https://pic1.imgdb.cn/item/6817ad0b58cb8da5c8dc6f76.png',
            copyright: '© 2024 英语全科启蒙. All Rights Reserved.',
            searchEnabled: true,
            theme: 'theme-blue',
            appearanceMode: 'light',
        };
        try {
            await db.insert(schema.settings).values(defaultSettings);
            // After inserting, we should return the complete settings object.
            // Since we know what we inserted, we can construct it.
            // The DB assigns the ID, but since we removed it, we can just return the object.
            return defaultSettings;
        } catch (error) {
            // In a race condition, another request might have created it. Try fetching again.
            settingsResult = await db.select().from(schema.settings).limit(1);
            if (settingsResult.length > 0) {
                return settingsResult[0];
            }
            console.error("Failed to create or get default settings", error);
            // Return default object as a fallback to prevent site crash
            return defaultSettings;
        }
    }
    return settingsResult[0];
}


export const getSettings = async (): Promise<Settings> => {
    try {
        const settings = await getOrCreateDefaultSettings();
        return settings;
    } catch (error) {
        console.error("Database error fetching settings:", error);
        // Fallback to default settings if DB fails
        return {
            title: '英语全科启蒙',
            logo: 'https://pic1.imgdb.cn/item/6817ad0b58cb8da5c8dc6f76.png',
            copyright: '© 2024 英语全科启蒙. All Rights Reserved.',
            searchEnabled: true,
            theme: 'theme-blue',
            appearanceMode: 'light',
        };
    }
};

export const getCategories = async (): Promise<Category[]> => {
    try {
        const categoriesResult = await db.query.categories.findMany({
            with: {
                links: {
                    orderBy: (links, { asc }) => [asc(links.sortOrder)],
                },
            },
            orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        });

        return categoriesResult;
    } catch (error) {
        console.error("Database error fetching categories:", error);
        return []; // Return empty array on DB error
    }
};
