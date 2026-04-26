import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center container-app">
    <div className="text-center">
      <p className="text-9xl font-extrabold text-brand-600">404</p>
      <h1 className="text-3xl mt-3">Halaman tidak ditemukan</h1>
      <p className="text-slate-600 mt-2">Sepertinya halaman yang Anda cari sudah pindah atau tidak tersedia.</p>
      <Link to="/" className="btn-primary mt-6">← Kembali ke Beranda</Link>
    </div>
  </div>
);

export default NotFound;
