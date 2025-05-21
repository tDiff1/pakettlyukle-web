"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import slugify from "slugify";
import Loading from "../loading";
import { compileMDX } from "next-mdx-remote/rsc";

type Blog = {
  id: string;
  blog_title: string;
  blog_description: string;
  blog_imageUrl?: string;
  compiledContent?: React.ReactNode;
};

const Blog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compiledBlogs, setCompiledBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs");
        const data: Blog[] | { message: string } = await res.json();

        if (res.ok) {
          if ("message" in data) {
            setBlogs([]);
            setCompiledBlogs([]);
          } else {
            setBlogs(data);
            const compiled = await Promise.all(
              data.map(async (blog: Blog) => {
                const textMaxLength = blog.blog_imageUrl ? 570 : 1095;
                const text =
                  blog.blog_description.length > textMaxLength
                    ? blog.blog_description.slice(0, textMaxLength)
                    : blog.blog_description;
                const { content } = await compileMDX({
                  source: text,
                  components: {
                    a: ({ children, ...props }) => (
                      <span className="text-blue-600 underline" {...props}>
                        {children}
                      </span>
                    ),
                    p: ({ children, ...props }) => (
                      <span className="inline-block" {...props}>
                        {children}
                      </span>
                    ),
                  },
                });
                return { ...blog, compiledContent: content };
              })
            );
            setCompiledBlogs(compiled);
          }
        } else {
          setError("Bloglar yüklenirken hata oluştu.");
        }
      } catch {
        setError("Bloglar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loading />
      </div>
    );
  }

  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (blogs.length === 0)
    return <p className="text-center mt-10">Henüz blog bulunmamaktadır.</p>;

  return (
    <div className="px-4">
      <h1 className="text-center font-bold text-4xl sm:text-5xl lg:text-6xl mb-10">BLOG</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {compiledBlogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${slugify(blog.blog_title, {
              lower: true,
              strict: true,
            })}`}
            className="bg-white flex flex-col rounded-3xl p-5 shadow-md hover:scale-[1.02] transition-transform duration-300 h-full"
          >
            {blog.blog_imageUrl && (
              <Image
                src={blog.blog_imageUrl}
                alt={blog.blog_title}
                width={1000}
                height={240}
                className="rounded-lg object-cover w-full h-[200px]"
              />
            )}

            <div className="flex flex-col flex-grow mt-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3">
                {blog.blog_title}
              </h2>
              <div className="text-sm text-gray-800 line-clamp-6">
                {blog.compiledContent}
                {blog.blog_description.length > (blog.blog_imageUrl ? 570 : 1095) && (
                  <span className="text-blue-600 cursor-pointer">...devamını oku</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
