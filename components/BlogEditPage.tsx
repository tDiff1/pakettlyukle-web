"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import rehypeSanitize from "rehype-sanitize";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

interface Blog {
  id: number;
  blog_title: string;
  blog_description: string;
  blog_imageUrl?: string;
  createdAt: string;
}

const BlogEditPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    image: null as File | null,
    imageUrl: "",
  });
  const [newBlog, setNewBlog] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (info) {
      const timer = setTimeout(() => setInfo(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [info]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) throw new Error("Bloglar getirilemedi");
      const data = await response.json();
      const sortedBlogs = Array.isArray(data)
        ? data.sort(
            (a: Blog, b: Blog) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : [];
      setBlogs(sortedBlogs);
      setError(null);
    } catch {
      setError("Bloglar yüklenirken hata oluştu.");
    }
  };

  const startEditing = (blog: Blog) => {
    setEditingId(blog.id);
    setEditForm({
      title: blog.blog_title,
      description: blog.blog_description,
      image: null,
      imageUrl: blog.blog_imageUrl || "",
    });
    setError(null);
    setInfo(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "", image: null, imageUrl: "" });
    setError(null);
    setInfo(null);
    setConfirmDelete(null);
  };

  const saveChanges = async () => {
    if (!editingId) return;
    const original = blogs.find((b) => b.id === editingId);
    if (!original) return;

    const { title, description, image } = editForm;
    if (
      title === original.blog_title &&
      description === original.blog_description &&
      !image
    ) {
      cancelEditing();
      return;
    }

    try {
      const formData = new FormData();
      formData.append("blog_title", title);
      formData.append("blog_description", description);
      if (image) formData.append("blog_imageUrl", image);

      const response = await fetch(`/api/blogs/${editingId}`, {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogs(
          blogs
            .map((b) => (b.id === editingId ? updatedBlog : b))
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
        );
        cancelEditing();
        setInfo("Blog başarıyla güncellendi.");
      } else {
        throw new Error("Güncelleme başarısız");
      }
    } catch {
      setError("Blog güncellenirken hata oluştu.");
    }
  };

  const deleteBlog = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/blogs/${confirmDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setBlogs(blogs.filter((b) => b.id !== confirmDelete));
        cancelEditing();
        setConfirmDelete(null);
        setInfo("Blog başarıyla silindi.");
      } else {
        throw new Error("Silme başarısız");
      }
    } catch {
      setError("Blog silinirken hata oluştu.");
      setConfirmDelete(null);
    }
  };

  const addNewBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, description, image } = newBlog;
    if (!title.trim() || !description.trim()) {
      setError("Başlık ve açıklama zorunludur.");
      return;
    }
    if (blogs.some((b) => b.blog_title.toLowerCase() === title.toLowerCase())) {
      setError("Bu başlığa sahip bir blog zaten var.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("blog_title", title);
      formData.append("blog_description", description);
      if (image) formData.append("blog_imageUrl", image);

      const response = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Blog eklenemedi");
      }
      const addedBlog = await response.json();
      setBlogs((prevBlogs) => {
        const newBlogs = [...prevBlogs, addedBlog].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return newBlogs;
      });
      setNewBlog({ title: "", description: "", image: null });
      setShowAddForm(false);
      setError(null);
      setInfo("Blog başarıyla eklendi.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Blog eklenemedi";
      console.error("Error:", errorMessage);
      setError(errorMessage);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setEditForm({
        ...editForm,
        image: file,
        imageUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewBlog({ ...newBlog, image: file });
    }
  };

  function truncateTextWithLink(text: string | undefined, maxLength: number) {
    if (!text) return null;
    if (text.length <= maxLength) {
      return <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{text}</ReactMarkdown>;
    }
    return (
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {text.slice(0, maxLength) + "... [devamını oku](#)"}
      </ReactMarkdown>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {error && (
        <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
      )}
      {info && (
        <p className="text-green-500 mb-4 text-center font-medium">{info}</p>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blog Yönetim Paneli</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "İptal Et" : "Yeni Blog Ekle"}
        </button>
      </div>
      {showAddForm && (
        <form
          onSubmit={addNewBlog}
          className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={newBlog.title}
              onChange={(e) =>
                setNewBlog({ ...newBlog, title: e.target.value })
              }
              placeholder="Blog başlığını girin"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                newBlog.title ? "focus:ring-blue-600" : "border-red-300"
              }`}
              required
            />
            {!newBlog.title && (
              <p className="text-red-500 text-xs mt-1">Başlık zorunludur</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Markdown destekler)
            </label>
            <textarea
              value={newBlog.description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, description: e.target.value })
              }
              placeholder="Açıklama (örneğin: [Turkcell paketi](https://örnek-link.com) veya [Ahmet](https://example.com))"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                newBlog.description ? "focus:ring-blue-600" : "border-red-300"
              }`}
              rows={5}
              required
            />
            {!newBlog.description && (
              <p className="text-red-500 text-xs mt-1">Açıklama zorunludur</p>
            )}
            <div className="mt-2 p-2 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700">Önizleme</h3>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {newBlog.description || "Önizleme burada görünecek"}
              </ReactMarkdown>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görsel (İsteğe bağlı)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleNewImageChange}
              className="text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newBlog.image && (
              <p className="text-sm text-gray-500 mt-2">{newBlog.image.name}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            disabled={!newBlog.title || !newBlog.description}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Blog Ekle
          </button>
        </form>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => {
          const textMaxLength = blog.blog_imageUrl ? 790 : 1230;
          return editingId === blog.id ? (
            <div
              key={String(blog.id)}
              className="relative p-4 bg-white rounded-lg shadow-lg"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama (Markdown destekler)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={5}
                />
                <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Önizleme
                  </h3>
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {editForm.description || "Önizleme burada görünecek"}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görsel
                </label>
                {editForm.imageUrl && (
                  <Image
                    src={editForm.imageUrl}
                    alt="Seçilen görsel"
                    width={300}
                    height={150}
                    className="w-full h-36 object-cover rounded-lg mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {confirmDelete === blog.id ? (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    Bu blogu silmek istediğinizden emin misiniz?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={deleteBlog}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Evet
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Hayır
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={saveChanges}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => setConfirmDelete(blog.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Sil
                  </button>
                </div>
              )}
              <span className="absolute top-2 right-2 text-xs text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
          ) : (
            <div
              key={String(blog.id)}
              className="relative p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
              onClick={() => startEditing(blog)}
            >
              {blog.blog_imageUrl && (
                <Image
                  src={blog.blog_imageUrl}
                  alt={blog.blog_title}
                  width={300}
                  height={150}
                  className="w-full h-36 object-cover rounded-lg mt-4"
                />
              )}
              <h2 className="text-xl font-semibold text-gray-800 my-5">
                {blog.blog_title}
              </h2>
              <div className="text-sm text-gray-600">
                {truncateTextWithLink(blog.blog_description, textMaxLength)}
              </div>
              <span className="absolute top-2 right-2 text-xs text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogEditPage;