'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from './db';
import { adminConfig } from './schema';
import { eq } from 'drizzle-orm';

const sessionCookieName = 'erin-nav-session';

const readAuthData = async (): Promise<{ adminPasswordHash: string }> => {
    let config = await db.query.adminConfig.findFirst();

    if (!config) {
        const defaultPassword = 'password';
        const defaultHash = hashPassword(defaultPassword);
        [config] = await db.insert(adminConfig).values({ id: 1, adminPasswordHash: defaultHash }).returning();
    }
    
    if (!config) {
        throw new Error("Failed to create or retrieve admin config.");
    }

    return { adminPasswordHash: config.adminPasswordHash };
};

const writeAuthData = async (passwordHash: string): Promise<void> => {
  // Check if a config exists
  const existingConfig = await db.query.adminConfig.findFirst({
    where: eq(adminConfig.id, 1),
  });

  if (existingConfig) {
    await db.update(adminConfig)
      .set({ adminPasswordHash: passwordHash })
      .where(eq(adminConfig.id, 1));
  } else {
    await db.insert(adminConfig).values({ id: 1, adminPasswordHash: passwordHash });
  }
};


function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function login(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get('password') as string;

  if (!password) {
    return {
      error: '密码不能为空',
    };
  }

  const { adminPasswordHash } = await readAuthData();
  const inputHash = hashPassword(password);

  if (inputHash === adminPasswordHash) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    cookies().set(sessionCookieName, 'loggedIn', { expires, httpOnly: true });
    redirect('/admin');
  } else {
    return {
      error: '密码错误',
    };
  }
}

export async function logout() {
  cookies().delete(sessionCookieName);
  redirect('/admin/login');
}


const passwordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, '新密码至少需要6个字符'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '新密码和确认密码不匹配',
    path: ['confirmPassword'],
  });

export async function changePassword(
  formData: FormData
): Promise<{ message: string; type: 'success' | 'error' }> {
  const validatedFields = passwordSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { message: validatedFields.error.errors[0].message, type: 'error' };
  }

  const { currentPassword, newPassword } = validatedFields.data;
  
  const { adminPasswordHash: storedHash } = await readAuthData();
  const currentHash = hashPassword(currentPassword);

  if (currentHash !== storedHash) {
    return { message: '当前密码不正确。', type: 'error' };
  }

  try {
    const newHash = hashPassword(newPassword);
    await writeAuthData(newHash);
    return { message: '密码修改成功！', type: 'success' };
  } catch (e) {
    const error = e as Error;
    return { message: `密码修改失败: ${error.message}`, type: 'error' };
  }
}
