"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Category, LinkItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Globe, ChevronDown, ChevronUp } from "lucide-react";

// 分类图标映射
const categoryIcons: Record<string, string> = {
  "常用网站": "⭐",
  "学习资源": "📚",
  "开发工具": "⚡",
  "设计资源": "🎨",
  "在线工具": "🔧",
};

// 卡片高度（用于计算折叠时的容器高度）
// 卡片高度约 140px (p-5 + icon 48px + text)
const CARD_HEIGHT = 150;

export function LinkGrid({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  // 存储每个分类的展开状态，key 是分类 ID
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      return categories;
    }
    return categories
      .map((category) => {
        const filteredLinks = category.links.filter(
          (link) =>
            link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.url.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { ...category, links: filteredLinks };
      })
      .filter((category) => category.links.length > 0);
  }, [searchTerm, categories]);

  // 切换分类的展开状态
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // 判断分类是否展开（默认根据 isCollapsed 决定）
  const isCategoryExpanded = (category: Category) => {
    // 如果用户手动切换过，使用用户的选择
    if (expandedCategories[category.id] !== undefined) {
      return expandedCategories[category.id];
    }
    // 否则使用后台设置的默认值（isCollapsed 为 true 时默认折叠）
    return !category.isCollapsed;
  };

  // 折叠时不需要切片，使用 CSS overflow 隐藏

  return (
    <div className="space-y-6">
      <div className="relative max-w-lg mx-auto mt-6">
        <Input
          type="search"
          placeholder="搜索..."
          className="w-full pl-4 pr-4 py-6 text-base rounded-lg shadow-sm bg-white dark:bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCategories.length > 0 ? (
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const isExpanded = isCategoryExpanded(category);
            const hasMoreLinks = category.links.length > 1;

            return (
              <section
                key={category.id}
                className="rounded-xl p-6 bg-[hsl(var(--section-bg))] relative"
              >
                {/* 展开/收起按钮 - 右上角 */}
                {hasMoreLinks && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="absolute top-4 right-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>收起 <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>展开全部 ({category.links.length}) <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}

                <h2 className="font-headline text-xl sm:text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                  <span className="text-2xl">{categoryIcons[category.name] || "📁"}</span>
                  {category.name}
                </h2>

                <div
                  className={`flex flex-wrap justify-start gap-3 sm:gap-4 transition-all duration-300 ${!isExpanded ? 'overflow-hidden' : ''}`}
                  style={!isExpanded ? { maxHeight: `${CARD_HEIGHT}px` } : {}}
                >
                  {category.links.map((link) => (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                      key={link.id}
                    >
                      <div className="w-[120px] sm:w-[140px] flex flex-col items-center p-4 sm:p-5 rounded-xl bg-card border border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:bg-accent/50 transition-all duration-300 cursor-pointer relative overflow-visible">
                        <div className="w-12 h-12 mb-3 rounded-xl bg-[hsl(var(--icon-bg))] flex items-center justify-center overflow-hidden">
                          {link.logoUrl ? (
                            <Image
                              src={link.logoUrl}
                              alt={`${link.name} logo`}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          ) : (
                            <Globe className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm text-center text-foreground">{link.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 text-center line-clamp-1 group-hover:line-clamp-none group-hover:block transition-all duration-200">
                          {link.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">没有找到匹配的网站。</p>
        </div>
      )}
    </div>
  );
}
