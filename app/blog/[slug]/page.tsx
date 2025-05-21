"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import Image from "next/image";
import Loading from "@/app/loading";
import { compileMDX } from "next-mdx-remote/rsc";

interface Blog {
  blog_title: string;
  blog_description: string;
  blog_imageUrl?: string;
}

const BlogDetail = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compiledContent, setCompiledContent] = useState<ReactNode | null>(null);

  useEffect(() => {
    async function fetchBlogBySlug() {
      try {
        const res = await fetch(`/api/blogs/slug/${slug}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Blog getirilemedi");

        setBlog(data);
        const { content } = await compileMDX({
          source: data.blog_description,
          components: {
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                className="text-blue-600 underline hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            ),
            p: ({ children, ...props }) => (
              <span className="inline-block" {...props}>
                {children}
              </span>
            ),
          },
        });
        setCompiledContent(content);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlogBySlug();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loading />
      </div>
    );
  }

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!blog) return <p className="text-center mt-10">Blog bulunamadı.</p>;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Geri Dön Butonu */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-all duration-200"
        >
          ← Geri Dön
        </button>
      </div>

      {/* Blog İçeriği */}
      <div className="bg-white p-5 sm:p-6 md:p-10 rounded-3xl shadow-lg flex flex-col lg:flex-row gap-8">
        {/* Görsel */}
        {blog.blog_imageUrl && (
          <div className="w-full lg:w-1/2">
            <Image
              src={blog.blog_imageUrl}
              alt={blog.blog_title}
              width={800}
              height={500}
              className="rounded-2xl shadow-md object-cover w-full h-auto max-h-[400px]"
            />
          </div>
        )}

        {/* Metin İçeriği */}
        <div className="flex flex-col gap-4 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">
            {blog.blog_title}
          </h1>
          <div className="text-gray-700 text-base leading-relaxed prose max-w-none">
            {compiledContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
