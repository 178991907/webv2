"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Category, LinkItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe, ChevronDown, ChevronUp, Star, BookOpen, Zap, Palette, Wrench, Folder, type LucideIcon } from "lucide-react";

// 分类图标映射 - 使用 Lucide SVG 图标（遵循 ui-ux-pro-max 规范：禁止使用 emoji）
const categoryIcons: Record<string, LucideIcon> = {
  "常用网站": Star,
  "学习资源": BookOpen,
  "开发工具": Zap,
  "设计资源": Palette,
  "在线工具": Wrench,
};

// 卡片高度（用于计算折叠时的容器高度）
// 卡片高度约 180px (sm) + gap
const CARD_HEIGHT = 190;

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
          className="theme-input w-full pl-4 pr-4 py-6 text-base shadow-sm bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300"
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
                className="theme-section p-6 bg-[hsl(var(--section-bg))] relative transition-all duration-300"
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
                  {(() => {
                    const IconComponent = categoryIcons[category.name] || Folder;
                    return <IconComponent className="h-6 w-6 text-primary" />;
                  })()}
                  {category.name}
                </h2>

                <div
                  className={`link-grid-container flex flex-wrap justify-start gap-3 sm:gap-4 transition-all duration-300 ${!isExpanded ? 'overflow-hidden' : ''}`}
                  style={!isExpanded ? { maxHeight: `${CARD_HEIGHT}px` } : {}}
                >
                  {category.links.map((link) => (
                    <TooltipProvider key={link.id}>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <div className="theme-card w-[140px] sm:w-[160px] h-[160px] sm:h-[180px] flex flex-col items-center pt-8 sm:pt-8 p-4 sm:p-5 bg-card card-premium cursor-pointer relative overflow-hidden transition-all duration-300">
                              <div className="w-16 h-16 mb-2 rounded-xl bg-[#2e265c] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 shrink-0">
                                {link.logoUrl ? (
                                  <Image
                                    src={link.logoUrl}
                                    alt={`${link.name} logo`}
                                    width={64}
                                    height={64}
                                    className="object-contain bg-white w-full h-full"
                                  />
                                ) : (
                                  <Globe className="h-8 w-8 text-white/80 group-hover:text-white transition-colors" />
                                )}
                              </div>
                              <h3 className="font-medium text-sm text-center text-foreground group-hover:text-primary transition-colors mb-1 shrink-0">{link.name}</h3>
                              <p className="text-xs text-muted-foreground text-center line-clamp-1 group-hover:line-clamp-2 transition-all duration-200">
                                {link.description}
                              </p>
                            </div>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[220px] bg-popover/90 backdrop-blur-md border-primary/20 p-3 shadow-xl z-50">
                          <p className="font-bold text-sm mb-1 text-primary">{link.name}</p>
                          <p className="text-xs text-foreground/80 leading-relaxed break-words">{link.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
