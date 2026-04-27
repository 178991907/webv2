"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Category, LinkItem } from "@/lib/types";
import { saveAllCategories } from "@/lib/actions";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash, GripVertical, PlusCircle, Save, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const linkSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效的URL"),
  description: z.string().min(1, "描述不能为空"),
  logoUrl: z.string().url("请输入有效的图片URL").optional().or(z.literal('')),
});

type LinkFormData = z.infer<typeof linkSchema>;

// 可拖拽的链接行组件
function SortableLink({
  link,
  categoryId,
  onEdit,
  onDelete
}: {
  link: LinkItem;
  categoryId: string;
  onEdit: (link: LinkItem, categoryId: string) => void;
  onDelete: (linkId: string, categoryId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded flex items-center justify-center"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="font-medium text-sm">{link.name}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-xs text-sm hidden sm:table-cell">{link.url}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-xs text-sm hidden md:table-cell">{link.description}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-xs text-sm hidden lg:table-cell">{link.logoUrl}</TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(link, categoryId)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>
                  这将永久删除 "{link.name}" 链接。此操作在点击"保存所有更改"后生效。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(link.id, categoryId)}>
                  确认
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

// 可拖拽的分类组件
function SortableCategory({
  category,
  categoryIndex,
  totalCategories,
  onEdit,
  onDelete,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onMoveUp,
  onMoveDown,
  onToggleCollapse,
  onLinkDragEnd
}: {
  category: Category;
  categoryIndex: number;
  totalCategories: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAddLink: (categoryId: string) => void;
  onEditLink: (link: LinkItem, categoryId: string) => void;
  onDeleteLink: (linkId: string, categoryId: string) => void;
  onMoveUp: (categoryId: string) => void;
  onMoveDown: (categoryId: string) => void;
  onToggleCollapse: (categoryId: string) => void;
  onLinkDragEnd: (event: DragEndEvent, categoryId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <AccordionItem
      value={category.id}
      key={category.id}
      className="border-b-0 rounded-lg border bg-background"
      ref={setNodeRef}
      style={style}
    >
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-semibold">{category.name}</span>
            {category.isCollapsed && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground ml-2">默认折叠</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-auto mr-4">
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (categoryIndex !== 0) onMoveUp(category.id);
              }}
              className={`h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted transition-colors ${categoryIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ChevronUp className="h-4 w-4" />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (categoryIndex !== totalCategories - 1) onMoveDown(category.id);
              }}
              className={`h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted transition-colors ${categoryIndex === totalCategories - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="flex items-center justify-end gap-2 mb-4 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit className="mr-2 h-3 w-3" /> 编辑名称
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-3 w-3" /> 删除分类
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>
                  这将永久删除 "{category.name}" 分类及其所有链接。此操作在点击"保存所有更改"后生效。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(category.id)}>
                  确认
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" onClick={() => onAddLink(category.id)}>
            <Plus className="mr-2 h-4 w-4" /> 添加链接
          </Button>
          <Button
            variant={category.isCollapsed ? "secondary" : "outline"}
            size="sm"
            onClick={() => onToggleCollapse(category.id)}
          >
            {category.isCollapsed ? '✅ 默认折叠' : '展开显示'}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => onLinkDragEnd(event, category.id)}
        >
          <SortableContext items={category.links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead className="hidden sm:table-cell">URL</TableHead>
                  <TableHead className="hidden md:table-cell">描述</TableHead>
                  <TableHead className="hidden lg:table-cell">Logo</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.links.map((link) => (
                  <SortableLink
                    key={link.id}
                    link={link}
                    categoryId={category.id}
                    onEdit={onEditLink}
                    onDelete={onDeleteLink}
                  />
                ))}
                {category.links.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      此分类下暂无链接。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </AccordionContent>
    </AccordionItem>
  );
}

export function LinkManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [openDialog, setOpenDialog] = useState<
    | { type: "add-cat" }
    | { type: "edit-cat"; category: Category }
    | { type: "add-link"; categoryId: string }
    | { type: "edit-link"; link: LinkItem; categoryId: string }
    | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // 确保初始化数据包含排序字段
    const processedCategories = initialCategories.map((cat, catIndex) => ({
      ...cat,
      sortOrder: cat.sortOrder ?? catIndex, // 如果没有sortOrder，使用索引
      links: cat.links.map((link, linkIndex) => ({
        ...link,
        sortOrder: link.sortOrder ?? linkIndex // 如果没有sortOrder，使用索引
      }))
    }));

    console.log('🔄 初始化处理后的分类数据:', JSON.stringify(processedCategories, null, 2));

    setCategories(processedCategories);
  }, [initialCategories]);

  // 分类拖拽结束处理
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 链接拖拽结束处理
  const handleLinkDragEnd = (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((prevCategories) => {
        return prevCategories.map((category) => {
          if (category.id === categoryId) {
            const oldIndex = category.links.findIndex((link) => link.id === active.id);
            const newIndex = category.links.findIndex((link) => link.id === over.id);
            return {
              ...category,
              links: arrayMove(category.links, oldIndex, newIndex),
            };
          }
          return category;
        });
      });
    }
  };

  // 分类上移
  const handleMoveCategoryUp = (categoryId: string) => {
    setCategories((items) => {
      const index = items.findIndex((item) => item.id === categoryId);
      if (index > 0) {
        return arrayMove(items, index, index - 1);
      }
      return items;
    });
  };

  // 分类下移
  const handleMoveCategoryDown = (categoryId: string) => {
    setCategories((items) => {
      const index = items.findIndex((item) => item.id === categoryId);
      if (index < items.length - 1) {
        return arrayMove(items, index, index + 1);
      }
      return items;
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LinkFormData>();

  const handleSaveChanges = () => {
    startTransition(async () => {
      const result = await saveAllCategories(categories);
      if (result?.error) {
        toast({ title: "错误", description: `保存失败: ${result.error}`, variant: "destructive" });
      } else {
        toast({ title: "成功", description: "所有更改已成功保存到服务器！" });
        router.refresh();
      }
    });
  }

  const handleOpenDialog = (dialog: NonNullable<typeof openDialog>) => {
    reset();
    if (dialog.type === 'edit-link') {
      setValue('name', dialog.link.name);
      setValue('url', dialog.link.url);
      setValue('description', dialog.link.description);
      setValue('logoUrl', dialog.link.logoUrl || '');
    }
    setOpenDialog(dialog);
  };

  const handleCategorySubmit = (data: { name: string }) => {
    if (!openDialog) return;

    if (openDialog.type === "add-cat") {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        sortOrder: categories.length,
        isCollapsed: false,
        links: [],
      };
      setCategories(prev => [...prev, newCategory]);
    } else if (openDialog.type === "edit-cat") {
      setCategories(prev => prev.map(c =>
        c.id === openDialog.category.id ? { ...c, name: data.name } : c
      ));
    }
    setOpenDialog(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const handleLinkSubmit = (data: LinkFormData) => {
    if (!openDialog) return;

    if (openDialog.type === "add-link") {
      setCategories(prev => prev.map(c => {
        if (c.id === openDialog.categoryId) {
          const newLink: LinkItem = {
            ...data,
            id: `link-${Date.now()}`,
            sortOrder: c.links.length,
            categoryId: openDialog.categoryId,
          };
          return { ...c, links: [...c.links, newLink] };
        }
        return c;
      }));
    } else if (openDialog.type === "edit-link") {
      setCategories(prev => prev.map(c => {
        if (c.id === openDialog.categoryId) {
          return {
            ...c,
            links: c.links.map(l =>
              l.id === openDialog.link.id ? { ...l, ...data } : l
            ),
          };
        }
        return c;
      }));
    }
    setOpenDialog(null);
  };

  const handleDeleteLink = (linkId: string, categoryId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return { ...c, links: c.links.filter(l => l.id !== linkId) };
      }
      return c;
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="text-lg sm:text-xl">分类和链接管理</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1 sm:flex-none" onClick={() => handleOpenDialog({ type: "add-cat" })}>
              <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden xs:inline">添加</span>分类
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={handleSaveChanges} disabled={isPending}>
              <Save className="mr-1 sm:mr-2 h-4 w-4" />
              {isPending ? '保存中...' : <><span className="hidden sm:inline">保存所有</span>更改</>}
            </Button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          拖拽分类或链接进行排序，使用上下箭头快速调整顺序。所有更改需要点击"保存所有更改"才会生效。
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCategoryDragEnd}
        >
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <Accordion type="multiple" className="w-full space-y-4">
              {categories.map((category, index) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  categoryIndex={index}
                  totalCategories={categories.length}
                  onEdit={(cat) => handleOpenDialog({ type: "edit-cat", category: cat })}
                  onDelete={handleDeleteCategory}
                  onAddLink={(catId) => handleOpenDialog({ type: "add-link", categoryId: catId })}
                  onEditLink={(link, catId) => handleOpenDialog({ type: 'edit-link', link, categoryId: catId })}
                  onDeleteLink={handleDeleteLink}
                  onMoveUp={handleMoveCategoryUp}
                  onMoveDown={handleMoveCategoryDown}
                  onToggleCollapse={(catId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, isCollapsed: !c.isCollapsed } : c))}
                  onLinkDragEnd={handleLinkDragEnd}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>

        {categories.length === 0 && (
          <div className="text-center py-16 border rounded-lg">
            <p className="text-muted-foreground">还没有任何分类。</p>
            <Button className="mt-4" onClick={() => handleOpenDialog({ type: "add-cat" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> 创建第一个分类
            </Button>
          </div>
        )}

      </CardContent>

      {/* Dialog for adding/editing categories */}
      <Dialog open={openDialog?.type === 'add-cat' || openDialog?.type === 'edit-cat'} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
        <DialogContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleCategorySubmit({ name: formData.get('name') as string });
          }}>
            <DialogHeader>
              <DialogTitle>{openDialog?.type === 'add-cat' ? '添加新分类' : '编辑分类名称'}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="category-name">分类名称</Label>
              <Input
                id="category-name"
                name="name"
                defaultValue={openDialog?.type === 'edit-cat' ? openDialog.category.name : ''}
                placeholder="请输入分类名称..."
                autoComplete="off"
                onPaste={(e) => e.stopPropagation()}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">取消</Button>
              </DialogClose>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding/editing links */}
      <Dialog open={openDialog?.type === 'add-link' || openDialog?.type === 'edit-link'} onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit(handleLinkSubmit)}>
            <DialogHeader>
              <DialogTitle>{openDialog?.type === 'add-link' ? '添加新链接' : '编辑链接'}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="link-name">名称</Label>
                <Input
                  id="link-name"
                  {...register("name")}
                  autoComplete="off"
                  onPaste={(e) => e.stopPropagation()}
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  {...register("url")}
                  placeholder="https://example.com"
                  autoComplete="off"
                  spellCheck={false}
                  onPaste={(e) => e.stopPropagation()}
                />
                {errors.url && <p className="text-destructive text-sm mt-1">{errors.url.message}</p>}
              </div>
              <div>
                <Label htmlFor="link-desc">描述</Label>
                <Textarea
                  id="link-desc"
                  {...register("description")}
                  placeholder="请输入链接描述..."
                  onPaste={(e) => e.stopPropagation()}
                />
                {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <Label htmlFor="link-logo">Logo 图片地址</Label>
                <Input
                  id="link-logo"
                  {...register("logoUrl")}
                  placeholder="https://example.com/logo.png"
                  onPaste={(e) => {
                    // 确保粘贴事件正常工作
                    e.stopPropagation();
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errors.logoUrl && <p className="text-destructive text-sm mt-1">{errors.logoUrl.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">取消</Button>
              </DialogClose>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}