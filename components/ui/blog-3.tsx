"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconPlaceholder } from "@/components/ui/blog-3-utils/icon-placeholder";

export interface BlogAuthor {
  name: string;
  initials: string;
  img?: number;
  avatarUrl?: string;
  role?: string;
}

export interface BlogPostItem {
  id?: string | number;
  category: string;
  title: string;
  image: string;
  excerpt: string;
  author: BlogAuthor;
  date: string;
  readTime: string;
  rawItem?: unknown;
}

export interface BlogBlockProps {
  badgeLabel?: string;
  heading?: string;
  description?: string;
  featuredPost?: BlogPostItem;
  posts?: BlogPostItem[];
  categories?: string[];
  hideHeader?: boolean;
  showSectionWrapper?: boolean;
  onSelectPost?: (post: BlogPostItem) => void;
  className?: string;
}

const DEFAULT_FEATURED: BlogPostItem = {
  id: "featured-evakuasi-elevasi",
  category: "Strategi Evakuasi",
  title: "Rute Menuju Elevasi Aman dalam 12 Menit Pertama",
  image: "/img/bento-evacuation-route.jpg",
  excerpt:
    "Algoritma rute pesisir SAMUDRA.3D memetakan jalur tercepat menuju bukit dan shelter vertikal dengan menghindari jembatan rawan likuifaksi serta zona genangan.",
  author: { name: "Dr. Raka Pratama", initials: "RP" },
  date: "14 Nov 2026",
  readTime: "6 Menit Baca",
};

const DEFAULT_POSTS: BlogPostItem[] = [
  {
    id: "post-telemetri-buoy",
    category: "Teknologi Sensor",
    title: "Kalibrasi Buoy DART dan Seismometer Dasar Laut Subduksi Jawa",
    image: "/img/bento-buoy-warning.jpg",
    excerpt:
      "Sensor tekanan dasar laut memverifikasi anomali kolom air secara langsung dalam hitungan detik sebelum peringatan dirilis.",
    author: { name: "Nadia Kusuma", initials: "NK" },
    date: "10 Nov 2026",
    readTime: "5 Menit Baca",
  },
  {
    id: "post-tas-siaga-darurat",
    category: "Kesiapsiagaan",
    title: "Daftar Perbekalan Tas Siaga Bencana untuk Keluarga Pesisir",
    image: "/img/cover-2.jpg",
    excerpt:
      "Air minum, peluit darurat, dokumen tahan air, dan radio baterai yang wajib tersedia dalam jangkauan 30 detik.",
    author: { name: "Bima Santoso", initials: "BS" },
    date: "06 Nov 2026",
    readTime: "4 Menit Baca",
  },
  {
    id: "post-batimetri-3d",
    category: "Riset Oseanografi",
    title: "Pemodelan Batimetri 3D untuk Memprediksi Pantulan Gelombang",
    image: "/img/cover-1.jpg",
    excerpt:
      "Bentuk teluk sempit memperkuat amplitudo run-up; peta 3D membantu menentukan zona merah lebih presisi.",
    author: { name: "Sari Wulandari", initials: "SW" },
    date: "02 Nov 2026",
    readTime: "8 Menit Baca",
  },
  {
    id: "post-sirine-offline",
    category: "Teknologi Sensor",
    title: "Menjaga Navigasi Peta Evakuasi Tetap Aktif Saat Seluler Padam",
    image: "/img/bento-offline-navigation.jpg",
    excerpt:
      "Cache tile peta dan kompas GPS lokal memungkinkan warga tetap menemukan titik kumpul tertinggi tanpa koneksi internet.",
    author: { name: "Dian Permana", initials: "DP" },
    date: "28 Okt 2026",
    readTime: "5 Menit Baca",
  },
  {
    id: "post-gejala-alam",
    category: "Kesiapsiagaan",
    title: "Mengenali Tanda Alam Tsunami Sebelum Sirine Peringatan Berbunyi",
    image: "/img/cover-3.jpg",
    excerpt:
      "Gempa terasa lebih dari 20 detik, air laut surut mendadak, dan gemuruh dari arah samudra menuntut evakuasi mandiri segera.",
    author: { name: "Tariq Hidayat", initials: "TH" },
    date: "21 Okt 2026",
    readTime: "6 Menit Baca",
  },
  {
    id: "post-shelter-vertikal",
    category: "Strategi Evakuasi",
    title: "Standar Keamanan Gedung Tinggi sebagai Tempat Evakuasi Sementara",
    image: "/img/bento-shelter-tes.jpg",
    excerpt:
      "Struktur beton bertulang minimal lantai tiga ke atas dapat menjadi penyelamat ketika bukit berada di luar jangkauan jalan kaki.",
    author: { name: "Hana Pertiwi", initials: "HP" },
    date: "14 Okt 2026",
    readTime: "7 Menit Baca",
  },
];

function formatCategoryLabel(cat: string): string {
  const clean = String(cat || "").trim();
  if (!clean) return "";
  if (clean === clean.toUpperCase() || clean === clean.toLowerCase()) {
    return clean
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }
  return clean;
}

function getAvatarSrc(author: BlogAuthor): string | undefined {
  if (author.avatarUrl && author.avatarUrl.trim() !== "") {
    return author.avatarUrl;
  }
  if (typeof author.img === "number") {
    return `https://i.pravatar.cc/150?img=${author.img}`;
  }
  return undefined;
}

export function BlogBlock({
  badgeLabel = "Eksplorasi Lapangan",
  heading = "Mitigasi & Pengetahuan Terkini",
  description = "Instruksi kesiapsiagaan, panduan lapangan, dan dokumentasi tindakan berbasis data seismik serta pemodelan pesisir SAMUDRA.3D.",
  featuredPost,
  posts,
  categories,
  hideHeader = false,
  showSectionWrapper = true,
  onSelectPost,
  className,
}: BlogBlockProps) {
  const activeFeatured = featuredPost ?? DEFAULT_FEATURED;
  const activePosts = posts && posts.length > 0 ? posts : DEFAULT_POSTS;

  const categoryList = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.includes("Semua")
        ? categories
        : ["Semua", ...categories];
    }
    const uniqueCats = Array.from(
      new Set(activePosts.map((p) => p.category).filter(Boolean))
    );
    return ["Semua", ...uniqueCats];
  }, [categories, activePosts]);

  const [active, setActive] = useState<string>("Semua");

  useEffect(() => {
    if (!categoryList.includes(active)) {
      setActive("Semua");
    }
  }, [categoryList, active]);

  const visible =
    active === "Semua"
      ? activePosts
      : activePosts.filter((p) => p.category === active);

  const handleOpenPost = (post: BlogPostItem) => {
    if (onSelectPost) {
      onSelectPost(post);
      return;
    }
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as { __navigateToArticle?: (id: string) => void })
        .__navigateToArticle === "function" &&
      post.id !== undefined
    ) {
      (
        window as unknown as { __navigateToArticle: (id: string) => void }
      ).__navigateToArticle(String(post.id));
    }
  };

  const innerContent = (
    <div className="blog3-container mx-auto w-full max-w-6xl">
      {!hideHeader && (
        <div className="blog3-header mb-10 flex flex-col gap-3">
          <Badge variant="secondary" className="blog3-header-badge w-fit">
            <IconPlaceholder
              lucide="Bookmark"
              tabler="IconBookmark"
              hugeicons="BookmarkIcon"
              phosphor="Bookmark"
              remixicon="RiBookmarkLine"
              data-icon="inline-start"
              size={14}
            />
            {badgeLabel}
          </Badge>
          <h2 className="blog3-heading font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="blog3-subheading max-w-2xl text-muted-foreground">
            {description}
          </p>
        </div>
      )}

      <Card
        className="blog3-featured-card group mb-12 overflow-hidden p-0 md:grid md:grid-cols-2"
        onClick={() => handleOpenPost(activeFeatured)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenPost(activeFeatured);
          }
        }}
      >
        <div className="blog3-featured-media relative aspect-video overflow-hidden bg-muted md:aspect-auto md:h-full">
          <img
            src={activeFeatured.image || "/img/bento-evacuation-route.jpg"}
            alt={activeFeatured.title}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = "1";
                target.src = "/img/bento-evacuation-route.jpg";
              }
            }}
            className="blog3-featured-img size-full object-cover transition-all duration-300"
          />
          <div className="blog3-media-scrim" aria-hidden="true" />
          <span className="blog3-featured-spot">Sorotan Utama</span>
          <span className="blog3-readtime-pill blog3-readtime-pill--featured">
            <IconPlaceholder
              lucide="Clock"
              tabler="IconClock"
              hugeicons="TimeIcon"
              phosphor="Clock"
              remixicon="RiTimeLine"
              size={12}
              className="size-3"
            />
            {activeFeatured.readTime}
          </span>
        </div>

        <div className="blog3-featured-body flex flex-col justify-between gap-4 p-6 sm:p-8">
          <div className="blog3-featured-main">
            <div className="blog3-featured-meta">
              <Badge className="blog3-category-badge w-fit">
                {activeFeatured.category}
              </Badge>
              <span className="blog3-meta-dot" aria-hidden="true">&bull;</span>
              <span className="blog3-featured-date">{activeFeatured.date}</span>
            </div>
            <h3 className="blog3-featured-title font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {activeFeatured.title}
            </h3>
            <p className="blog3-featured-excerpt text-muted-foreground">
              {activeFeatured.excerpt}
            </p>
          </div>
          <div className="blog3-featured-footer">
            <div className="blog3-author-row flex items-center gap-3">
              <Avatar className="blog3-avatar--lg size-9 border border-border">
                <AvatarImage
                  src={getAvatarSrc(activeFeatured.author)}
                  alt={activeFeatured.author.name}
                />
                <AvatarFallback>{activeFeatured.author.initials}</AvatarFallback>
              </Avatar>
              <div className="blog3-author-meta text-sm">
                <p className="blog3-author-name font-medium">
                  {activeFeatured.author.name}
                </p>
                <p className="blog3-author-date text-muted-foreground">
                  {activeFeatured.author.role || "Kontributor SAMUDRA"}
                </p>
              </div>
            </div>
            <div className="blog3-featured-actions">
              <Button
                render={<a href={`#artikel-${activeFeatured.id ?? "utama"}`} />}
                nativeButton={false}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenPost(activeFeatured);
                }}
              >
                Baca Artikel
                <IconPlaceholder
                  lucide="ArrowRight"
                  tabler="IconArrowRight"
                  hugeicons="ArrowRightIcon"
                  phosphor="ArrowRight"
                  remixicon="RiArrowRightLine"
                  data-icon="inline-end"
                  size={15}
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div
        className="blog3-filters mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter kategori artikel"
      >
        {categoryList.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={isActive}
              className={cn(
                "blog3-filter-btn rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive && "is-active"
              )}
            >
              {category === "Semua" ? category : formatCategoryLabel(category)}
            </button>
          );
        })}
      </div>

      <div className="blog3-grid grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((post, idx) => (
          <Card
            key={post.id ?? `${post.title}-${idx}`}
            className="blog3-post-card group flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
            onClick={() => handleOpenPost(post)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenPost(post);
              }
            }}
          >
            <div className="blog3-post-media relative aspect-video overflow-hidden bg-muted">
              <img
                src={post.image || "/img/cover-1.jpg"}
                alt={post.title}
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallbackApplied) {
                    target.dataset.fallbackApplied = "1";
                    target.src = "/img/cover-1.jpg";
                  }
                }}
                className="blog3-post-img size-full object-cover transition-all duration-300"
              />
              <div className="blog3-media-scrim" aria-hidden="true" />
              <span className="blog3-readtime-pill">
                <IconPlaceholder
                  lucide="Clock"
                  tabler="IconClock"
                  hugeicons="TimeIcon"
                  phosphor="Clock"
                  remixicon="RiTimeLine"
                  size={12}
                  className="size-3"
                />
                {post.readTime}
              </span>
            </div>

            <CardHeader className="blog3-post-header gap-2 px-5 pt-5">
              <Badge variant="secondary" className="blog3-category-badge w-fit">
                {post.category}
              </Badge>
              <CardTitle className="blog3-post-title text-lg leading-snug">
                <a
                  href={`#artikel-${post.id ?? idx}`}
                  className="blog3-post-link transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenPost(post);
                  }}
                >
                  {post.title}
                </a>
              </CardTitle>
            </CardHeader>

            <CardContent className="blog3-post-content flex-1 px-5">
              <p className="blog3-post-excerpt text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            </CardContent>

            <CardFooter className="blog3-post-footer items-center gap-3 px-5 pb-5">
              <Avatar className="blog3-avatar--sm size-8 border border-border">
                <AvatarImage
                  src={getAvatarSrc(post.author)}
                  alt={post.author.name}
                />
                <AvatarFallback className="text-xs">
                  {post.author.initials}
                </AvatarFallback>
              </Avatar>
              <div className="blog3-author-meta min-w-0 text-xs">
                <p className="blog3-author-name truncate font-medium text-foreground">
                  {post.author.name}
                </p>
                <p className="blog3-author-date text-muted-foreground">
                  {post.date}
                </p>
              </div>
              <span className="blog3-card-arrow" aria-hidden="true">
                <IconPlaceholder lucide="ArrowUpRight" size={14} />
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!showSectionWrapper) {
    return <div className={cn("blog3-root", className)}>{innerContent}</div>;
  }

  return (
    <section
      className={cn(
        "blog3-section flex w-full justify-center bg-background px-6 py-16 text-foreground",
        className
      )}
    >
      {innerContent}
    </section>
  );
}

export default BlogBlock;
