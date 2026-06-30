import React, { useState, useMemo, useEffect } from 'react';
import { District, Author } from '../types';
import { PixelButton } from './PixelButton';
import { Trash2, Edit2, LogOut, X, Plus, Save, AlignLeft, Image as ImageIcon, ChevronLeft, Filter } from 'lucide-react';
import { NewsItem, NewsBlock, loadNewsItems, saveNewsItems, subscribeToNews, saveNewsItemToFirebase, deleteNewsItemFromFirebase } from './newsData';
import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth, googleProvider } from '../firebase';

const loadAuthors = (): Author[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('embarca_authors_v1');
  return stored ? JSON.parse(stored) : [];
};

const saveAuthors = (authors: Author[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('embarca_authors_v1', JSON.stringify(authors));
};

const uploadToStorage = async (file: File, folder = 'images'): Promise<string> => {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const extractIframeSrc = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith('<iframe') || trimmed.startsWith('<IFRAME')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    return match ? match[1] : value;
  }
  return value;
};

const normalizeYoutubeUrl = (url: string) => {
  url = extractIframeSrc(url);
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const normalizeSpotifyUrl = (url: string) => {
  url = extractIframeSrc(url);
  if (url.includes('open.spotify.com/') && !url.includes('/embed/')) {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  }
  return url;
};


export const AdminPanel = ({ onExit }: { onExit?: () => void }) => {
  useEffect(() => {
    document.body.style.cursor = 'default';
    return () => {
      document.body.style.cursor = 'none';
    };
  }, []);

  const [step, setStep] = useState<'loading' | 'login' | 'panel'>('loading');

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [view, setView] = useState<'list' | 'edit'>('list');
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => loadNewsItems());
  const [authors, setAuthors] = useState<Author[]>(() => loadAuthors());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<'ALL' | District>('ALL');

  useEffect(() => {
    // Si no estás logueado en el panel, podrías no suscribirte.
    // Pero lo haremos a nivel componente.
    if (step !== 'panel') return;

    const unsubscribeNews = subscribeToNews((items) => {
      setNewsItems(items);
    });

    let unsubscribeAuthors = () => {};
    if (db) {
      try {
        unsubscribeAuthors = onSnapshot(collection(db, 'authors'), (snapshot) => {
          const items = snapshot.docs.map(doc => doc.data() as Author);
          setAuthors(items.length ? items : loadAuthors());
        }, (err) => {
          console.error("Authors subscription error:", err);
          setAuthors(loadAuthors());
        });
      } catch (err) {
        console.error("Failed to subscribe to authors:", err);
        setAuthors(loadAuthors());
      }
    } else {
      setAuthors(loadAuthors());
    }

    return () => {
      unsubscribeNews();
      unsubscribeAuthors();
    };
  }, [step]);

  // Author Management  
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [spotifyUrlForm, setSpotifyUrlForm] = useState('');
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [youtubeUrlForm, setYoutubeUrlForm] = useState('');
  const [youtubeDistrictForm, setYoutubeDistrictForm] = useState<'NATION' | 'BOOSTER' | 'CONNECT' | 'VC'>('NATION');
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorForm, setAuthorForm] = useState<Partial<Author>>({ name: '', imageUrl: '' });

  const initialForm: Partial<NewsItem> = {
    title: '', summary: '', date: '', type: 'news', isExternal: false, district: undefined,
    category: '', authors: [], blocks: []
  };
  const [formData, setFormData] = useState<Partial<NewsItem>>(initialForm);

  const filteredItems = useMemo(() => {
    let items = [...newsItems];
    if (filterDistrict !== 'ALL') {
      if (filterDistrict === 'NATION') {
        items = items.filter(i => !i.district || i.district === 'NATION');
      } else {
        items = items.filter(i => i.district === filterDistrict);
      }
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [newsItems, filterDistrict]);

  const dashboardStats = useMemo(() => {
    return {
      total: newsItems.length,
      news: newsItems.filter(i => i.type === 'news').length,
      events: newsItems.filter(i => i.type === 'event').length
    };
  }, [newsItems]);

  useEffect(() => {
    if (!auth) {
      console.warn("Auth not available. Running dashboard in local/offline mode.");
      setStep('panel');
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.email.toLowerCase()));
          if (adminDoc.exists()) {
            setStep('panel');
          } else {
            showToast('Email no autorizado');
            await signOut(auth);
            setStep('login');
          }
        } catch (error) {
          console.error("Error checking admin status", error);
          showToast('Error verificando permisos');
          setStep('login');
        }
      } else {
        setStep('login');
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    if (!auth) {
      showToast('Firebase no configurado. Entrando en modo offline.', 'success');
      setStep('panel');
      return;
    }
    try {
      setStep('loading');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      showToast('Error en login con Google');
      setStep('login');
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setStep('login');
      if (onExit) onExit();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    setFormData(initialForm);
    setEditingId(null);
    setView('edit');
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({ ...item, blocks: item.blocks || [] });
    setEditingId(item.id);
    setView('edit');
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) return showToast('Completa el título');
    if (!formData.date) return showToast('Completa la fecha');

    // Check if date is valid and year is reasonable (prevents year 200000 etc)
    const year = new Date(formData.date).getFullYear();
    if (year < 2000 || year > 2100) return showToast('Por favor ingresá un año válido (ej. 2024)');

    if (!formData.summary?.trim()) return showToast('Completa el resumen breve');
    if (formData.type === 'news' && formData.isExternal && !formData.externalUrl?.trim()) return showToast('Completa el link externo de la noticia');

    const districtValue = (formData.district === 'NATION' || !formData.district) ? undefined : formData.district as District;
    const finalData = { ...formData, district: districtValue };

    try {
      if (editingId) {
        const item = { ...finalData, id: editingId } as NewsItem;
        await saveNewsItemToFirebase(item);
      } else {
        const newItem = { ...finalData, id: Date.now().toString() } as NewsItem;
        await saveNewsItemToFirebase(newItem);
      }
      setView('list');
      showToast('Entrada guardada con éxito', 'success');
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      showToast('Error al guardar en Firebase');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar?')) {
      try {
        await deleteNewsItemFromFirebase(id);
        showToast('Eliminado', 'success');
      } catch (error) {
        console.error("Error deleting from Firebase:", error);
        showToast('Error al eliminar');
      }
    }
  };



  // Block Editor Functions
  const addTextBlock = () => {
    setFormData(prev => ({ ...prev, blocks: [...(prev.blocks || []), { id: Date.now().toString(), type: 'text', content: '' }] }));
  };

  const addImageBlock = () => {
    setFormData(prev => ({ ...prev, blocks: [...(prev.blocks || []), { id: Date.now().toString(), type: 'image', url: '', caption: '' }] }));
  };

  const updateBlock = (id: string, updates: Partial<NewsBlock>) => {
    setFormData(prev => ({
      ...prev,
      blocks: (prev.blocks || []).map(b => b.id === id ? { ...b, ...updates } as NewsBlock : b)
    }));
  };

  const removeBlock = (id: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: (prev.blocks || []).filter(b => b.id !== id)
    }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...(formData.blocks || [])];
    if (direction === 'up' && index > 0) {
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = temp;
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = temp;
    }
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const handleSaveAuthor = async () => {
    if (!authorForm.name) return showToast('El autor debe tener nombre');
    try {
      const authorList = loadAuthors();
      if (editingAuthorId) {
        const author = { ...authorForm, id: editingAuthorId } as Author;
        if (db) {
          await setDoc(doc(db, 'authors', author.id), author);
        } else {
          const idx = authorList.findIndex(a => a.id === editingAuthorId);
          if (idx > -1) authorList[idx] = author;
          saveAuthors(authorList);
          setAuthors(authorList);
          showToast('Autor actualizado localmente ✓', 'success');
        }
      } else {
        const author = { ...authorForm, id: Date.now().toString() } as Author;
        if (db) {
          await setDoc(doc(db, 'authors', author.id), author);
        } else {
          authorList.push(author);
          saveAuthors(authorList);
          setAuthors(authorList);
          showToast('Autor creado localmente ✓', 'success');
        }
      }
      setAuthorForm({ name: '', imageUrl: '' });
      setEditingAuthorId(null);
    } catch (e) {
      console.error(e);
      showToast('Error guardando autor');
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    if (confirm('¿Eliminar autor?')) {
      try {
        if (db) {
          await deleteDoc(doc(db, 'authors', id));
        } else {
          const authorList = loadAuthors().filter(a => a.id !== id);
          saveAuthors(authorList);
          setAuthors(authorList);
          showToast('Autor eliminado localmente ✓', 'success');
        }
      } catch (e) {
        console.error(e);
        showToast('Error eliminando autor');
      }
    }
  };

  if (step !== 'panel') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md text-center">
          <h1 className="text-3xl font-bold mb-8 font-pixel text-cyan-400">Admin Login</h1>
          {step === 'loading' ? (
            <div className="animate-pulse text-cyan-400 font-mono">Verificando...</div>
          ) : (
            <PixelButton variant="primary" onClick={handleGoogleLogin} className="w-full">
              Continuar con Google
            </PixelButton>
          )}
        </div>

        {toast && (
          <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
            <span className="font-bold tracking-wider">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-cyan-400">Embarca<span className="text-white">Dashboard</span></h1>
          </div>
          <button onClick={handleLogout} className="flex gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition rounded-lg items-center text-sm font-bold uppercase tracking-widest"><LogOut size={16} /> Salir</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {!db && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between text-yellow-400 font-mono text-sm shadow-lg backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
              <span><strong>Modo Offline Activo:</strong> Firebase no está configurado. Los cambios se guardarán localmente en el navegador.</span>
            </div>
          </div>
        )}

        {view === 'list' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 flex flex-col gap-2">
                <span className="text-zinc-500 font-mono text-sm uppercase">Total Records</span>
                <span className="text-4xl font-bold">{dashboardStats.total}</span>
              </div>
              <div className="bg-cyan-900/20 p-6 rounded-xl border border-cyan-500/20 flex flex-col gap-2">
                <span className="text-cyan-500/80 font-mono text-sm uppercase">Noticias</span>
                <span className="text-4xl font-bold text-cyan-400">{dashboardStats.news}</span>
              </div>
              <div className="bg-fuchsia-900/20 p-6 rounded-xl border border-fuchsia-500/20 flex flex-col gap-2">
                <span className="text-fuchsia-500/80 font-mono text-sm uppercase">Eventos</span>
                <span className="text-4xl font-bold text-fuchsia-400">{dashboardStats.events}</span>
              </div>
            </div>

            <div className="w-full bg-zinc-900/30 p-6 rounded-2xl border border-white/5 min-h-[600px]">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-3">
                  <AlignLeft size={24} className="text-cyan-400" /> Registros Publicados
                </h2>
                 <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={() => setIsSpotifyModalOpen(true)} className="flex gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-widest rounded-lg transition items-center">
                    Actualizar Spotify
                  </button>
                  <button onClick={() => setIsYoutubeModalOpen(true)} className="flex gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-lg transition items-center">
                    Actualizar YouTube
                  </button>
                  <button onClick={handleCreateNew} className="flex gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded-lg transition items-center">
                    <Plus size={18} /> Nueva Entrada
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <Filter size={16} className="text-zinc-500 mr-2" />
                {['ALL', 'NATION', 'BOOSTER', 'CONNECT', 'VC'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setFilterDistrict(dist as any)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition border ${filterDistrict === dist ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30'}`}
                  >
                    {dist === 'VC' ? 'VENTURE' : dist}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredItems.length === 0 && <div className="text-center p-8 text-zinc-600 font-mono">No hay registros para este filtro.</div>}

                {filteredItems.map(item => (
                  <div key={item.id} className="bg-black/50 p-5 rounded-xl flex justify-between items-start border border-white/5 hover:border-white/20 transition-all">
                    <div className="w-full flex justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex gap-3 mb-2 items-center">
                          <span className={`text-[10px] px-2 py-1 rounded font-mono font-bold uppercase tracking-widest ${item.type === 'news' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                            {item.type} {item.isExternal ? '(Ext)' : '(Int)'}
                          </span>
                          <span className="text-zinc-500 text-xs font-mono">{item.date}</span>
                          <span className="text-yellow-500/80 text-[10px] font-mono border border-yellow-500/20 px-2 py-0.5 rounded-full">{item.district || 'NATION'}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 leading-tight">{item.title}</h3>
                        {item.type === 'news' && (item.authors?.length || item.author) && (
                          <p className="text-zinc-400 text-sm">
                            Por {item.authors?.length ? item.authors.join(', ') : item.author}
                          </p>
                        )}
                        {item.type === 'event' && item.location && <p className="text-zinc-400 text-sm flex items-center gap-1">📍 {item.location}</p>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-zinc-800 hover:bg-cyan-900/50 text-white hover:text-cyan-400 rounded-lg transition"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-zinc-800 hover:bg-red-900/50 text-white hover:text-red-400 rounded-lg transition"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'edit' && (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 uppercase tracking-wider text-sm font-bold transition">
              <ChevronLeft size={16} /> Volver a la lista
            </button>

            <div className="bg-zinc-900/80 p-8 rounded-2xl border border-white/10 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
                {editingId ? <Edit2 size={20} className="text-cyan-400" /> : <Plus size={20} className="text-cyan-400" />}
                {editingId ? 'Editar Entrada' : 'Nueva Entrada'}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-zinc-400 uppercase">Tipo</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400">
                      <option value="news">Noticia</option>
                      <option value="event">Evento</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-zinc-400 uppercase">Distrito</label>
                    <select value={formData.district || 'NATION'} onChange={e => setFormData({ ...formData, district: e.target.value as any })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400">
                      <option value="NATION">Sin Distrito (Nation)</option>
                      <option value="BOOSTER">Booster</option>
                      <option value="CONNECT">Connect</option>
                      <option value="VC">Venture (VC)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-6 p-4 bg-black/50 rounded-lg border border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" checked={!formData.isExternal} onChange={() => setFormData({ ...formData, isExternal: false })} className="accent-cyan-400" />
                    <span className="group-hover:text-cyan-400 transition">Interna</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" checked={!!formData.isExternal} onChange={() => setFormData({ ...formData, isExternal: true })} className="accent-cyan-400" />
                    <span className="group-hover:text-cyan-400 transition">Externa</span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase">Título</label>
                  <input type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase">Fecha</label>
                  <input type="date" min="2020-01-01" max="2099-12-31" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 text-white" style={{ colorScheme: 'dark' }} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase">Resumen Breve (Card)</label>
                  <textarea placeholder="Breve descripción que aparece en la tarjeta principal" value={formData.summary || ''} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 min-h-[60px]" />
                </div>

                {formData.type === 'news' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-mono text-zinc-400 uppercase">Autor(es)</label>
                        <button onClick={() => setIsAuthorModalOpen(true)} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold tracking-wider uppercase">Gestionar Autores</button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {authors.map(a => (
                          <label key={a.id} className="flex items-center gap-2 text-zinc-300">
                            <input
                              type="checkbox"
                              checked={formData.authors?.includes(a.name) || formData.author === a.name}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                let newAuthors = formData.authors ? [...formData.authors] : (formData.author ? [formData.author] : []);
                                if (checked) {
                                  if (!newAuthors.includes(a.name)) newAuthors.push(a.name);
                                } else {
                                  newAuthors = newAuthors.filter(name => name !== a.name);
                                }
                                setFormData({ ...formData, authors: newAuthors });
                              }}
                              className="accent-cyan-500 bg-black border-white/10"
                            />
                            {a.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono text-zinc-400 uppercase">URL Imagen Principal</label>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="URL de la imagen" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="flex-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                        <span className="text-xs text-zinc-500 mx-2">o</span>
                        <label className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                          <ImageIcon size={16} /> Subir
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!storage) { showToast('Storage no disponible'); return; }
                            try {
                              const url = await uploadToStorage(file, 'news-images/articles');
                              setFormData(prev => ({ ...prev, imageUrl: url }));
                            } catch (err) {
                              showToast('Error subiendo imagen');
                            }
                          }} />
                        </label>
                      </div>
                    </div>

                    {!formData.isExternal && (
                      <div className="border border-white/10 rounded-xl overflow-hidden mt-6">
                        <div className="bg-black/50 p-4 border-b border-white/10 flex items-center justify-between">
                          <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><AlignLeft size={16} /> Contenido (Bloques)</span>
                          <div className="flex gap-2">
                            <button onClick={addTextBlock} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 rounded flex items-center gap-2 text-xs font-bold uppercase transition"><AlignLeft size={12} />Texto</button>
                            <button onClick={addImageBlock} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 rounded flex items-center gap-2 text-xs font-bold uppercase transition"><ImageIcon size={12} />Imagen</button>
                          </div>
                        </div>
                        <div className="p-4 space-y-4 bg-zinc-900/30">
                          {(!formData.blocks || formData.blocks.length === 0) && (
                            <div className="text-center p-8 text-zinc-500 font-mono text-sm border border-dashed border-white/10 rounded-lg">Añade bloques de texto o imagen para construir la noticia</div>
                          )}
                          {formData.blocks?.map((block, index) => (
                            <div key={block.id} className="bg-black p-4 rounded-lg border border-white/10 relative group">
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30">↑</button>
                                <button onClick={() => moveBlock(index, 'down')} disabled={index === (formData.blocks?.length || 0) - 1} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30">↓</button>
                                <button onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-900/50 text-red-400 rounded transition"><Trash2 size={14} /></button>
                              </div>

                              {block.type === 'text' && (
                                <div className="flex flex-col gap-2 pt-2">
                                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Bloque de Texto (HTML permitido)</label>
                                  <textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} className="w-full p-3 bg-zinc-900 border border-white/5 rounded focus:outline-none focus:border-cyan-400 min-h-[100px] text-sm font-mono" placeholder="<p>Tu contenido HTML aquí</p>" />
                                </div>
                              )}

                              {block.type === 'image' && (
                                <div className="flex flex-col gap-3 pt-2">
                                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Bloque de Imagen</label>
                                  <div className="flex gap-2 items-center">
                                    <input type="text" value={block.url} onChange={e => updateBlock(block.id, { url: e.target.value })} placeholder="URL de la imagen" className="flex-1 p-2 bg-zinc-900 border border-white/5 rounded text-sm focus:outline-none focus:border-cyan-400" />
                                    <span className="text-xs text-zinc-500">o</span>
                                    <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 px-3 py-2 rounded cursor-pointer transition flex items-center gap-2 text-xs font-bold uppercase whitespace-nowrap">
                                      <ImageIcon size={14} /> Subir
                                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (!storage) { showToast('Storage no disponible'); return; }
                                        try {
                                          const url = await uploadToStorage(file, 'news-images/blocks');
                                          updateBlock(block.id, { url });
                                        } catch (err) {
                                          showToast('Error subiendo imagen');
                                        }
                                      }} />
                                    </label>
                                  </div>
                                  <input type="text" value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} placeholder="Leyenda / Pie de foto (opcional)" className="w-full p-2 bg-zinc-900 border border-white/5 rounded text-sm focus:outline-none focus:border-cyan-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {formData.type === 'event' && (
                  <>
                    <textarea placeholder="Descripción del evento" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400 min-h-[100px]" />
                    <input type="time" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                    <input type="text" placeholder="Ubicación (Ej: Cowork Embarca)" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                    <input type="text" placeholder="URL Google Maps" value={formData.locationLink || ''} onChange={e => setFormData({ ...formData, locationLink: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono text-zinc-400 uppercase">URL Imagen Evento</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" placeholder="URL Imagen Evento" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="flex-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                        <span className="text-xs text-zinc-500">o</span>
                        <label className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                          <ImageIcon size={16} /> Subir
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!storage) { showToast('Storage no disponible'); return; }
                            try {
                              const url = await uploadToStorage(file, 'news-images/articles');
                              setFormData(prev => ({ ...prev, imageUrl: url }));
                            } catch (err) {
                              showToast('Error subiendo imagen');
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                    {formData.isExternal && <input type="text" placeholder="URL de Inscripción (Tickets)" value={formData.inscriptionUrl || ''} onChange={e => setFormData({ ...formData, inscriptionUrl: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />}
                  </>
                )}

                {formData.type === 'news' && formData.isExternal && (
                  <>
                    <input type="text" placeholder="URL Externa de la Noticia" value={formData.externalUrl || ''} onChange={e => setFormData({ ...formData, externalUrl: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                    <input type="text" placeholder="URL de la Fuente (Opcional)" value={formData.sourceLink || ''} onChange={e => setFormData({ ...formData, sourceLink: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                  </>
                )}

                <div className="flex gap-4 pt-8 border-t border-white/10 mt-8">
                  <button onClick={handleSave} className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest rounded-lg flex justify-center items-center gap-2 transition"><Save size={18} /> {editingId ? 'Guardar Cambios' : 'Publicar Entrada'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Author Management Modal */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-cyan-400">Autores</h3>
              <button onClick={() => { setIsAuthorModalOpen(false); setEditingAuthorId(null); setAuthorForm({ name: '', imageUrl: '' }); }} className="text-zinc-500 hover:text-white transition"><X size={24} /></button>
            </div>

            <div className="flex gap-4 mb-8">
              <div className="flex-1 space-y-3">
                <input type="text" placeholder="Nombre del autor" value={authorForm.name || ''} onChange={e => setAuthorForm({ ...authorForm, name: e.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="URL Foto (Opcional)" value={authorForm.imageUrl || ''} onChange={e => setAuthorForm({ ...authorForm, imageUrl: e.target.value })} className="flex-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400" />
                  <label className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-4 py-3 rounded-lg cursor-pointer transition flex items-center justify-center">
                    <ImageIcon size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!storage) { showToast('Storage no disponible'); return; }
                      try {
                        const url = await uploadToStorage(file, 'news-images/authors');
                        setAuthorForm(prev => ({ ...prev, imageUrl: url }));
                      } catch (err) {
                        showToast('Error subiendo imagen');
                      }
                    }} />
                  </label>
                </div>
              </div>
              <button onClick={handleSaveAuthor} className="bg-cyan-500 text-black p-3 rounded-lg font-bold hover:bg-cyan-400 transition self-end h-[116px] w-[100px]">
                {editingAuthorId ? 'Guardar' : 'Agregar'}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {authors.length === 0 && <p className="text-center text-zinc-500 font-mono text-sm py-4">No hay autores registrados</p>}
              {authors.map(author => (
                <div key={author.id} className="flex justify-between items-center p-3 bg-black/50 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {author.imageUrl ? <img src={author.imageUrl} alt={author.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">{author.name.charAt(0)}</div>}
                    <span className="font-medium text-white/90">{author.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingAuthorId(author.id); setAuthorForm(author); }} className="text-zinc-500 hover:text-cyan-400 transition"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteAuthor(author.id)} className="text-zinc-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Spotify Modal */}
      {isSpotifyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-green-400">Link de Spotify Global</h3>
              <button onClick={() => setIsSpotifyModalOpen(false)} className="text-zinc-500 hover:text-white transition"><X size={24} /></button>
            </div>
            <p className="text-sm text-zinc-400 mb-6 font-mono">Este link se mostrará en todos los distritos. Sugerencia: utiliza el link de inserción (embed) que provee Spotify.</p>
            <input type="text" placeholder="https://open.spotify.com/embed/..." value={spotifyUrlForm} onChange={e => setSpotifyUrlForm(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-green-400 mb-6" />
            <button onClick={async () => {
              if (!spotifyUrlForm.trim()) { showToast('Ingresá un link de Spotify'); return; }
              try {
                const finalUrl = normalizeSpotifyUrl(spotifyUrlForm.trim());
                if (db) {
                  await setDoc(doc(db, 'settings', 'spotify'), { url: finalUrl });
                } else {
                  localStorage.setItem('embarca_setting_spotify', finalUrl);
                }
                setIsSpotifyModalOpen(false);
                setSpotifyUrlForm('');
                showToast('Spotify actualizado ✓', 'success');
              } catch (err: any) {
                console.error(err);
                showToast('Error al guardar: ' + (err?.message || err));
              }
            }} className="w-full bg-green-500 text-black p-4 rounded-lg font-bold hover:bg-green-400 transition uppercase tracking-wider">
              Guardar Spotify Global
            </button>
          </div>
        </div>
      )}

      {/* YouTube Modal */}
      {isYoutubeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-red-500">Link de YouTube por Distrito</h3>
              <button onClick={() => setIsYoutubeModalOpen(false)} className="text-zinc-500 hover:text-white transition"><X size={24} /></button>
            </div>
            <p className="text-sm text-zinc-400 mb-6 font-mono">Cada distrito puede tener un video distinto. Selecciona el distrito e ingresa el link de inserción de YouTube.</p>
            <div className="flex flex-col gap-4 mb-6">
              <select value={youtubeDistrictForm} onChange={e => setYoutubeDistrictForm(e.target.value as any)} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-red-500 font-bold uppercase text-white">
                <option value="NATION">NATION</option>
                <option value="BOOSTER">BOOSTER</option>
                <option value="CONNECT">CONNECT</option>
                <option value="VC">VENTURE (VC)</option>
              </select>
              <input type="text" placeholder="https://www.youtube.com/embed/..." value={youtubeUrlForm} onChange={e => setYoutubeUrlForm(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-red-500 text-white" />
            </div>
            <button onClick={async () => {
              if (!youtubeUrlForm.trim()) { showToast('Ingresá un link de YouTube'); return; }
              try {
                const finalUrl = normalizeYoutubeUrl(youtubeUrlForm.trim());
                if (db) {
                  await setDoc(doc(db, 'settings', 'youtube_' + youtubeDistrictForm), { url: finalUrl });
                } else {
                  localStorage.setItem('embarca_setting_youtube_' + youtubeDistrictForm, finalUrl);
                }
                setIsYoutubeModalOpen(false);
                setYoutubeUrlForm('');
                showToast('YouTube actualizado para ' + youtubeDistrictForm + ' ✓', 'success');
              } catch (err: any) {
                console.error(err);
                showToast('Error al guardar: ' + (err?.message || err));
              }
            }} className="w-full bg-red-600 text-white p-4 rounded-lg font-bold hover:bg-red-500 transition uppercase tracking-wider">
              Guardar YouTube
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
          <span className="font-bold tracking-wider">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
      )}
    </div>
  );
};
