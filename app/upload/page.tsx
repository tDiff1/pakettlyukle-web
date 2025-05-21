// app/upload/page.tsx
'use server';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export default async function UploadForm() {
  async function uploadImage(formData: FormData): Promise<void> {
    'use server';
    const imageFile = formData.get('image') as File;
    await put(imageFile.name, imageFile, { access: 'public' });
    revalidatePath('/');
  }

  return (
    <form action={uploadImage}>
      <label htmlFor="image">Resim</label>
      <input type="file" id="image" name="image" accept="image/*" required />
      <button type="submit">Yükle</button>
    </form>
  );
}