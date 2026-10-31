"use client";
import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function FUIBentoGridDark() {
  return (
    <div className="pt-24 container mx-auto max-w-[1140px] flex flex-col p-6">
      <div className="mb-8">
        <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
          Fitur Utama Platform
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mt-2">
          Solusi cepat saat detik-detik kritis.
        </h2>
        <p className="max-w-2xl text-base text-gray-400 mt-2">
          Aplikasi dirancang dengan arsitektur tangguh: navigasi ke tempat aman, akses kontak darurat instan, dan panduan mitigasi bencana resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Data Telemetri BMKG & Buoy"
          title="Peringatan Dini Gelombang Real-Time"
          description="Integrasi sensor seismik dasar laut dan buoy BMKG otomatis memantau rambatan gelombang, kedalaman hiposentrum, dan estimasi waktu tiba (ETA) tsunami."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80')" }} 
            />
          }
          className="max-lg:rounded-t-3xl lg:col-span-3 lg:rounded-tl-4xl"
        />
        <BentoCard
          eyebrow="Navigasi & Evakuasi Mandiri"
          title="Rute Menuju Elevasi Aman"
          description="Algoritma rute memandu Anda dari garis pantai rawan menuju bukit dan shelter elevasi tinggi, menghindari jembatan runtuh serta zona genangan air laut."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80')" }} 
            />
          }
          className="lg:col-span-3 lg:rounded-tr-4xl"
        />
        <BentoCard
          eyebrow="Respons Darurat SOS"
          title="Akses Kontak Darurat"
          description="Panggilan cepat satu ketukan ke Basarnas maritim, posko BPBD, ambulans darurat, serta pengiriman sinyal darurat koordinat ke keluarga."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80')" }} 
            />
          }
          className="lg:col-span-2 lg:rounded-bl-4xl"
        />
        <BentoCard
          eyebrow="Titik Kumpul Terverifikasi"
          title="Peta Titik Kumpul & Shelter"
          description="Peta shelter evakuasi vertikal (TES) dan perbukitan pesisir yang tervalidasi aman dari jangkauan limpasan air laut gelombang tsunami."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')" }} 
            />
          }
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Offline Readiness"
          title="Siaga Mode Offline Penuh"
          description="Peta jalur evakuasi dan materi keselamatan tersimpan di gawai lokal sehingga tetap berfungsi saat pemancar BTS dan internet padam pascagempa."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80')" }} 
            />
          }
          className="max-lg:rounded-b-3xl lg:col-span-2 lg:rounded-br-4xl"
        />
      </div>
    </div>
  );
}

export function BentoCard({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = ["top", "bottom"],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "bg-[#020712] transform-gpu border border-cyan-500/20 [box-shadow:0_-20px_80px_-20px_rgba(0,210,255,0.12)_inset] shadow-2xl ring-1 ring-white/10 hover:border-cyan-400/40 transition-all duration-300",
        "data-[dark]:bg-gray-900 data-[dark]:ring-white/15"
      )}
    >
      <div className="relative h-[18rem] shrink-0 overflow-hidden">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#020712]/70 via-transparent to-transparent opacity-80" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-[#020712]/80 to-transparent opacity-95" />
        )}
      </div>
      <div className="relative p-7 z-20 isolate mt-[-85px] backdrop-blur-xl bg-[#020712]/85 border-t border-white/10 text-white flex flex-col justify-end">
        <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
          {eyebrow}
        </span>
        <p className="mt-1.5 text-lg font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-gray-300 line-clamp-3">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
