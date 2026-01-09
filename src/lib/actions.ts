'use server';

import { revalidatePath } from 'next/cache';
import { db } from './db';
import { settings as settingsTable, categories as categoriesTable, links as linksTable } from './schema';
import type { Settings, Category, LinkItem } from './types';
import { eq, sql } from 'drizzle-orm';

export async function saveSettings(newSettings: Omit<Settings, 'id'>) {
    try {
        await db.update(settingsTable)
            .set({
                ...newSettings
            });

        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error('Failed to save settings:', error);
        return { error: `数据库操作失败: ${error.message}` };
    }
}


export async function saveAllCategories(categories: Category[]) {
    try {
        console.log('💾 开始保存分类，接收到的数据:', JSON.stringify(categories, null, 2));

        await db.transaction(async (tx) => {
            // Delete all links and categories that are no longer in the new state.
            const linkIdsToKeep = categories.flatMap(c => c.links).map(l => l.id).filter(Boolean);
            const categoryIdsToKeep = categories.map(c => c.id).filter(Boolean);

            console.log('🔍 要保留的分类ID:', categoryIdsToKeep);
            console.log('🔍 要保留的链接ID:', linkIdsToKeep);

            if (linkIdsToKeep.length > 0) {
                await tx.execute(sql`DELETE FROM ${linksTable} WHERE id NOT IN ${linkIdsToKeep}`);
            } else {
                await tx.execute(sql`DELETE FROM ${linksTable}`);
            }

            if (categoryIdsToKeep.length > 0) {
                await tx.execute(sql`DELETE FROM ${categoriesTable} WHERE id NOT IN ${categoryIdsToKeep}`);
            } else {
                await tx.execute(sql`DELETE FROM ${categoriesTable}`);
            }

            // Upsert categories with sort order
            for (const [index, category] of categories.entries()) {
                console.log(`💾 保存分类 "${category.name}" (sortOrder: ${index})`);

                await tx.insert(categoriesTable)
                    .values({
                        id: category.id,
                        name: category.name,
                        sortOrder: index,
                        isCollapsed: category.isCollapsed ?? false
                    })
                    .onConflictDoUpdate({
                        target: categoriesTable.id,
                        set: {
                            name: category.name,
                            sortOrder: index,
                            isCollapsed: category.isCollapsed ?? false
                        }
                    });

                // Upsert links for the category with sort order
                if (category.links.length > 0) {
                    for (const [linkIndex, link] of category.links.entries()) {
                        console.log(`  💾 保存链接 "${link.name}" (sortOrder: ${linkIndex})`);

                        await tx.insert(linksTable)
                            .values({
                                id: link.id,
                                name: link.name,
                                url: link.url,
                                description: link.description,
                                logoUrl: link.logoUrl,
                                sortOrder: linkIndex,
                                categoryId: category.id,
                            })
                            .onConflictDoUpdate({
                                target: linksTable.id,
                                set: {
                                    name: link.name,
                                    url: link.url,
                                    description: link.description,
                                    logoUrl: link.logoUrl,
                                    sortOrder: linkIndex,
                                    categoryId: category.id,
                                }
                            });
                    }
                }
            }
        });

        console.log('✅ 分类保存成功');
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error('❌ Failed to save all categories:', error);
        return { error: `数据库事务失败: ${error.message}` };
    }
}
