# AI Agent SOP dan Regulasi - Portal Internal Instansi Pemerintah

Aplikasi tata kelola dokumen kedinasan, penelusuran standar operasional prosedur (SOP) resmi, dan sinkronisasi regulasi perundang-undangan (JDIH Komdigi) dengan kendali hak akses berbasis peran (RBAC) dan pertahanan keamanan AI.

---

## 🛠️ Penyelesaian Masalah Dependency Deployment ke Vercel

### 1. Penyebab Konflik Versi Sebelumnya
Saat build atau deploy di Vercel, proses instalasi gagal dengan error:
```
Conflicting peer dependency: esbuild@0.28.2
vite@8.3.4
npm install exited with 1
```
**Akar Masalah:**
- Pada `package.json` lama, versi `esbuild` dipatok secara eksplisit ke `"esbuild": "^0.25.0"`.
- Namun, `vite@8.3.4` dan `tsx@4.21.0+` membutuhkan `esbuild: "^0.27.0 || ^0.28.0"` (yang terpasang adalah `0.28.2`).
- Ketidaksesuaian ini menyebabkan NPM engine di Vercel (yang menerapkan strict peer dependency resolution) gagal melakukan build (`exit code 1`).

### 2. Solusi yang Diterapkan (Tanpa `--force` atau `--legacy-peer-deps`)
- Memperbarui dependensi dev `esbuild` pada `package.json` ke versi kompatibel `"esbuild": "^0.28.2"`.
- Menyelaraskan seluruh paket sehingga `vite@8.3.4`, `tsx`, dan `esbuild` berada dalam satu versi pohon dependensi yang valid (`esbuild@0.28.2 deduped`).
- Menjalankan `npm install` dan memverifikasi `npm ls esbuild vite` menghasilkan `0 vulnerabilities` dan `exit code 0`.
- Memperbaiki `vite.config.ts` untuk menggunakan `import.meta.dirname` menggantikan `__dirname` yang usang.

---

## 📁 Daftar File yang Diubah & Dibuat

1. **`package.json`**: Memperbarui versi `esbuild` menjadi `^0.28.2` agar sinkron dengan `vite@8.3.4`.
2. **`metadata.json`**: Mengisi identitas resmi nama dan deskripsi aplikasi.
3. **`index.html`**: Menyesuaikan judul portal dan meta tag Bahasa Indonesia.
4. **`vite.config.ts`**: Menyesuaikan path alias menggunakan `import.meta.dirname`.
5. **`src/index.css`**: Menambahkan dukungan varian dark mode Tailwind v4 (`@custom-variant dark`).
6. **`src/types/index.ts`**: Definisi tipe lengkap (`User`, `Role`, `Team`, `Document`, `Feedback`, `AuditLog`, `JDIHSyncLog`).
7. **`src/data/initialData.ts`**: Pangkalan data contoh kedinasan Indonesia (SOP perjadin, cuti, honor, VPN, Permenkomdigi, SE jam kerja, dll).
8. **`src/services/store.ts`**: Reactive central store dengan isolasi hak akses dokumen (RBAC), audit logging, dan sinkronisasi JDIH.
9. **`src/services/aiRAG.ts`**: Mesin RAG cerdas dengan kutipan pasal verbatim, mode Ringkas vs Rinci, pertahanan prompt injection, dan peringatan regulasi kedaluwarsa.
10. **`src/components/Navbar.tsx`**: Header resmi dengan pemilih peran simulasi cepat (Guest, User, Admin Tim, Super Admin), indikator JDIH, dan dark mode.
11. **`src/components/Sidebar.tsx`**: Navigasi sidebar sesuai matriks peran (Guest & User hanya melihat Agent & KB; Admin melihat seluruh menu).
12. **`src/views/AgentView.tsx`**: Antarmuka tanya jawab AI konsultasi SOP dengan filter lingkup, mode jawaban, kartu sitasi rujukan resmi, dan umpan balik pengguna.
13. **`src/views/KnowledgeBaseView.tsx`**: Pangkalan data dokumen dengan multi-field search, filter 7 parameter, serta tampilan tabel/kartu.
14. **`src/views/DashboardView.tsx`**: Dasbor pemantauan regulasi berubah, SOP terdampak, metrik performa, dan log audit.
15. **`src/views/FeedbackView.tsx`**: Peninjauan laporan jawaban keliru dan tindak lanjut perbaikan rujukan oleh Admin Tim.
16. **`src/views/UsersTeamsView.tsx`**: Pengaturan struktur unit tim dan penugasan peran Admin Tim dengan izin dokumen tertentu.
17. **`src/views/SettingsView.tsx`**: Panel sinkronisasi JDIH Komdigi, status akun Google Drive, dan pengaturan keamanan.
18. **`src/components/DocumentDetailModal.tsx`**: Dossier lengkap dokumen, riwayat versi, status keberlakuan, dan izin unduh berpagar.
19. **`src/components/AddDocumentModal.tsx`**: Formulir penambahan tautan Google Drive SOP oleh Admin Tim / Super Admin.
20. **`src/components/BatchUploadModal.tsx`**: Fitur Batch Upload folder Google Drive untuk memindai seluruh SOP sekaligus (default: Publik) dengan opsi **"Deteksi Otomatis oleh AI Agent"** untuk menempatkan dokumen ke unit tim yang tepat berdasarkan analisis isi teks & klausul.
21. **`src/components/JDIHIframeModal.tsx`**: Iframe penelusuran regulasi langsung ke portal JDIH Komdigi dengan URL parameter `tentang="nama dokumen"&kategori=all&tahun=all`.
22. **`src/components/JDIHModal.tsx`**: Dialog fallback penelusuran mandiri portal resmi JDIH Komdigi.
23. **`src/components/ReportFeedbackModal.tsx`**: Formulir pelaporan kekeliruan rujukan jawaban AI.

---

## 🚀 Langkah Selanjutnya untuk Deploy Ulang ke Vercel

1. **Commit & Push Perubahan ke Git Repository:**
   ```bash
   git add package.json vite.config.ts metadata.json index.html src/ README.md
   git commit -m "fix: resolve peer dependency conflict between esbuild 0.28.2 and vite 8.3.4"
   git push origin main
   ```
2. **Pengaturan Project di Vercel Dashboard:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install` (Tidak perlu menambahkan `--legacy-peer-deps` karena pohon dependensi sudah bersih).
3. **Environment Variables di Vercel:**
   - Masukkan `GEMINI_API_KEY` (jika menggunakan pemanggilan model Gemini langsung).
4. **Trigger Redeploy:**
   - Klik tombol **Redeploy** pada deployment yang sebelumnya gagal. Vercel sekarang akan meng-install dependensi tanpa error `ELSPROBLEMS` dan menjalankan `vite build` hingga sukses.

---

## 🔒 Tata Kelola Hak Akses (RBAC)

| Peran | Ruang Lingkup | Hak Akses |
|---|---|---|
| **Guest (Tamu Publik)** | Terbuka | Menelusuri & bertanya SOP/Regulasi berstatus **Publik**. *Tidak dapat mengunggah SOP baru atau melihat dokumen internal tim.* |
| **User (Pegawai ASN)** | Terdaftar | Bertanya ke AI Agent, membaca dokumen publik & dokumen terbagi/timnya, mengunduh berkas (jika `downloadAllowed: true`), mengirim umpan balik. |
| **Admin Tim** | Unit Kerja Tim | Mengunggah tautan Google Drive SOP unitnya, mengatur visibilitas & izin unduh, meninjau umpan balik tim, memantau SOP terdampak regulasi baru. |
| **Super Admin** | Seluruh Sistem | Akses penuh seluruh dokumen, mengelola tim & menetapkan Admin Tim, memicu sinkronisasi JDIH, melihat log audit lengkap. |
