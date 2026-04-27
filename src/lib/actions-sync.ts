'use server';

import { db } from './db';
import * as schema from './schema';
import type { Settings, Category, LinkItem } from './types';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

// 数据导出格式
export interface ExportData {
    version: string;
    exportedAt: string;
    settings: Settings | null;
    categories: Category[];
}

/**
 * 导出当前数据库所有数据为 JSON
 */
export async function exportData(): Promise<{ data?: ExportData; error?: string }> {
    try {
        // 获取设置
        const settingsResult = await db.select().from(schema.settings).limit(1);
        const settings = settingsResult.length > 0 ? settingsResult[0] : null;

        // 获取分类和链接
        const categoriesResult = await db.query.categories.findMany({
            with: {
                links: {
                    orderBy: (links, { asc }) => [asc(links.sortOrder)],
                },
            },
            orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        });

        const exportData: ExportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            settings: settings as Settings | null,
            categories: categoriesResult as Category[],
        };

        return { data: exportData };
    } catch (e) {
        const error = e as Error;
        console.error('导出数据失败:', error);
        return { error: `导出失败: ${error.message}` };
    }
}

/**
 * 从 JSON 导入数据（重置后导入）
 */
export async function importData(jsonData: ExportData): Promise<{ success?: boolean; error?: string }> {
    try {
        console.log('📥 开始导入数据...');

        await db.transaction(async (tx) => {
            // 1. 清空现有数据
            console.log('🗑️ 清空现有数据...');
            await tx.execute(sql`DELETE FROM ${schema.links}`);
            await tx.execute(sql`DELETE FROM ${schema.categories}`);
            await tx.execute(sql`DELETE FROM ${schema.settings}`);

            // 2. 导入设置
            if (jsonData.settings) {
                console.log('📝 导入设置...');
                await tx.insert(schema.settings).values({
                    title: jsonData.settings.title,
                    logo: jsonData.settings.logo,
                    copyright: jsonData.settings.copyright,
                    searchEnabled: jsonData.settings.searchEnabled,
                });
            }

            // 3. 导入分类和链接
            for (const [index, category] of jsonData.categories.entries()) {
                console.log(`📁 导入分类: ${category.name}`);

                await tx.insert(schema.categories).values({
                    id: category.id,
                    name: category.name,
                    sortOrder: index,
                    isCollapsed: category.isCollapsed ?? false,
                });

                // 导入链接
                if (category.links && category.links.length > 0) {
                    for (const [linkIndex, link] of category.links.entries()) {
                        await tx.insert(schema.links).values({
                            id: link.id,
                            name: link.name,
                            url: link.url,
                            description: link.description,
                            logoUrl: link.logoUrl,
                            sortOrder: linkIndex,
                            categoryId: category.id,
                        });
                    }
                }
            }
        });

        console.log('✅ 数据导入成功');
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        const error = e as Error;
        console.error('❌ 导入数据失败:', error);
        return { error: `导入失败: ${error.message}` };
    }
}

/**
 * 从远程数据库同步数据
 */
export async function syncFromRemoteDb(remoteDbUrl: string): Promise<{ success?: boolean; error?: string }> {
    try {
        console.log('🔄 开始远程数据库同步...');

        // 创建远程数据库连接
        const remoteClient = postgres(remoteDbUrl);
        const remoteDb = drizzle(remoteClient, { schema });

        // 📥 从远程数据库获取数据 (使用原始 SQL 以处理字段不存在的情况)
        console.log('📥 从远程数据库读取数据 (RAW SQL)...');

        // 查询设置
        const remoteSettingsRaw = await remoteClient`SELECT * FROM settings LIMIT 1`;
        const settings = remoteSettingsRaw.length > 0 ? {
            title: remoteSettingsRaw[0].title,
            logo: remoteSettingsRaw[0].logo,
            copyright: remoteSettingsRaw[0].copyright,
            searchEnabled: remoteSettingsRaw[0].searchEnabled,
        } : null;

        // 查询所有链接
        const linksRaw = await remoteClient`SELECT * FROM links ORDER BY sort_order ASC`;

        // 查询分类
        const categoriesRaw = await remoteClient`SELECT * FROM categories ORDER BY sort_order ASC`;

        // 手动映射分类和链接，处理 is_collapsed 字段
        const mappedCategories: Category[] = categoriesRaw.map(cat => ({
            id: cat.id,
            name: cat.name,
            sortOrder: cat.sort_order ?? 0,
            isCollapsed: cat.is_collapsed !== undefined ? cat.is_collapsed : false,
            links: linksRaw
                .filter((l: any) => l.categoryId === cat.id)
                .map((l: any) => ({
                    id: l.id,
                    name: l.name,
                    url: l.url,
                    description: l.description,
                    logoUrl: l.logoUrl,
                    sortOrder: l.sort_order ?? 0,
                    categoryId: l.categoryId
                })) as LinkItem[]
        }));

        // 关闭远程连接
        await remoteClient.end();

        // 构建导出数据对象进行导入
        const importDataObj: ExportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            settings: settings as Settings,
            categories: mappedCategories,
        };

        // 使用导入函数导入数据
        const result = await importData(importDataObj);

        if (result.success) {
            console.log('✅ 远程数据库同步成功');
            return { success: true };
        } else {
            return result;
        }
    } catch (e) {
        const error = e as Error;
        console.error('❌ 远程数据库同步失败:', error);
        return { error: `同步失败: ${error.message}` };
    }
}
