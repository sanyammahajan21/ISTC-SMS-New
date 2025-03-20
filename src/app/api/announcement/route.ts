import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
const STORAGE_PATH = process.env.STORAGE_PATH || './public/uploads';
const PUBLIC_URL_PATH = '/uploads';

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await new Promise<any>((resolve, reject) => {
      const chunks: any[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        resolve(data);
      });
      req.on('error', (err) => reject(err));
    });

    const { title, content, type, teacherIds, file } = JSON.parse(formData);

    if (!title || !content || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileUrl = null;
    if (file) {
      const fileData = Buffer.from(file.data, 'base64');
      const fileExtension = file.name.split('.').pop();
      const safeFileName = `${Date.now()}_${file.name}`;
      const filePath = join(STORAGE_PATH, safeFileName);

      if (!existsSync(STORAGE_PATH)) {
        await mkdir(STORAGE_PATH, { recursive: true });
      }

      await writeFile(filePath, fileData);

      fileUrl = `${PUBLIC_URL_PATH}/${safeFileName}`;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        fileUrl,
        teachers: {
          create: type === 'TEACHER_SPECIFIC' ? teacherIds.map((teacherId: string) => ({ teacherId })) : [],
        },
      },
    });

    return res.status(200).json({ announcement });
  } catch (error) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
}