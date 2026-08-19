import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import styles from './Products.module.css';

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  name: '', category: 'keychains', price: '', originalPrice: '',
  stock: '', description: '', longDescription: '',
  isFeatured: false, isBestseller: false, isNew: false,
  customizable: false, enabled: true,
  images: [],
};

function fmt(n) { return 'Rs. ' + Number(n).toLocaleString('en-LK'); }

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdmin();

  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage]             = useState(1);

  const [modalType, setModalType]   = useState(null); // 'add' | 'edit' | 'delete' | 'view'
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [imgPreviews, setImgPreviews] = useState([]);

  // ── Filtering ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchCat    = !catFilter || p.category === catFilter;
      const matchStock  = !stockFilter
        || (stockFilter === 'low'  && p.stock <= 5)
        || (stockFilter === 'out'  && p.stock === 0)
        || (stockFilter === 'ok'   && p.stock > 5);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, catFilter, stockFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Helpers ────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setImgPreviews([]);
    setModalType('add');
  }

  function openEdit(p) {
    setSelected(p);
    setForm({
      name: p.name, category: p.category, price: p.price,
      originalPrice: p.originalPrice || '', stock: p.stock,
      description: p.description || '', longDescription: p.longDescription || '',
      isFeatured: p.isFeatured, isBestseller: p.isBestseller, isNew: p.isNew,
      customizable: p.customizable, enabled: p.enabled !== false,
      images: p.images || [],
    });
    setImgPreviews(p.images || []);
    setModalType('edit');
  }

  function openDelete(p) {
    setSelected(p);
    setModalType('delete');
  }

  function openView(p) {
    setSelected(p);
    setModalType('view');
  }

  function closeModal() {
    setModalType(null);
    setSelected(null);
  }

  function handleImgChange(e) {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImgPreviews(prev => [...prev, ...previews]);
    setForm(prev => ({ ...prev, images: [...(prev.images || []), ...previews] }));
  }

  function removePreview(idx) {
    setImgPreviews(prev => prev.filter((_, i) => i !== idx));
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      images: imgPreviews,
      rating: selected?.rating || 0,
      reviews: selected?.reviews || 0,
      tags: selected?.tags || [],
    };
    if (modalType === 'add') {
      addProduct(payload);
    } else {
      updateProduct(selected.id, payload);
    }
    closeModal();
  }

  function handleToggle(p, field) {
    updateProduct(p.id, { [field]: !p[field] });
  }

  function handleDelete() {
    deleteProduct(selected.id);
    closeModal();
  }

  // ── Columns ────────────────────────────────────────────────
  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (images) => (
        <img
          src={images?.[0] || 'https://placehold.co/48x48?text=No+Img'}
          alt=""
          className={styles.thumb}
        />
      ),
    },
    {
      key: 'name',
      label: 'Product',
      render: (name, p) => (
        <div>
          <div className={styles.prodName}>{name}</div>
          <div className={styles.prodMeta}>#{p.id} · {p.category}</div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (price, p) => (
        <div>
          <strong>{fmt(price)}</strong>
          {p.originalPrice && (
            <div className={styles.origPrice}>{fmt(p.originalPrice)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (stock) => (
        <span className={stock === 0 ? styles.stockOut : stock <= 5 ? styles.stockLow : styles.stockOk}>
          {stock === 0 ? 'Out' : stock <= 5 ? `${stock} Low` : stock}
        </span>
      ),
    },
    {
      key: 'isFeatured',
      label: 'Featured',
      render: (val, p) => (
        <button className={`${styles.toggleBtn} ${val ? styles.toggleOn : ''}`} onClick={() => handleToggle(p, 'isFeatured')}>
          {val ? '★' : '☆'}
        </button>
      ),
    },
    {
      key: 'customizable',
      label: 'Custom',
      render: (val, p) => (
        <button className={`${styles.toggleBtn} ${val ? styles.toggleOn : ''}`} onClick={() => handleToggle(p, 'customizable')}>
          {val ? '✏️ On' : '✏️ Off'}
        </button>
      ),
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (val, p) => (
        <button
          className={`${styles.statusToggle} ${val !== false ? styles.statusEnabled : styles.statusDisabled}`}
          onClick={() => handleToggle(p, 'enabled')}
        >
          {val !== false ? 'Enabled' : 'Disabled'}
        </button>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, p) => (
        <div className={styles.actions}>
          <button className={styles.btnView}   onClick={() => openView(p)}>View</button>
          <button className={styles.btnEdit}   onClick={() => openEdit(p)}>Edit</button>
          <button className={styles.btnDelete} onClick={() => openDelete(p)}>Delete</button>
        </div>
      ),
    },
  ];

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products in catalogue`}
        action={
          <button className={styles.addBtn} onClick={openAdd}>+ Add Product</button>
        }
      />

      <AdminTable
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={p => setPage(p)}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search products…"
        filters={[
          { key: 'cat', label: 'Category', options: catOptions, value: catFilter, onChange: v => { setCatFilter(v); setPage(1); } },
          {
            key: 'stock', label: 'Stock', value: stockFilter,
            options: [{ value: 'ok', label: 'In Stock' }, { value: 'low', label: 'Low Stock (≤5)' }, { value: 'out', label: 'Out of Stock' }],
            onChange: v => { setStockFilter(v); setPage(1); }
          },
        ]}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modalType === 'add' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'add' ? 'Add Product' : 'Edit Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Product Name *</label>
              <input required className={styles.input} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Category *</label>
              <select required className={styles.input} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (Rs.) *</label>
              <input required type="number" min="0" className={styles.input} value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Original Price (Rs.)</label>
              <input type="number" min="0" className={styles.input} value={form.originalPrice}
                onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock *</label>
              <input required type="number" min="0" className={styles.input} value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Short Description</label>
            <textarea rows={2} className={styles.textarea} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Long Description</label>
            <textarea rows={3} className={styles.textarea} value={form.longDescription}
              onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))} />
          </div>

          {/* Images */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Images</label>
            <label className={styles.imgUploadBtn}>
              📷 Upload Images
              <input type="file" accept="image/*" multiple hidden onChange={handleImgChange} />
            </label>
            {imgPreviews.length > 0 && (
              <div className={styles.imgPreviews}>
                {imgPreviews.map((src, i) => (
                  <div key={i} className={styles.imgPreviewWrap}>
                    <img src={src} alt="" className={styles.imgPreview} />
                    <button type="button" className={styles.imgRemove} onClick={() => removePreview(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className={styles.toggleRow}>
            {[
              ['isFeatured', '⭐ Featured'],
              ['isBestseller', '🔥 Bestseller'],
              ['isNew', '🆕 New'],
              ['customizable', '✏️ Customizable'],
              ['enabled', '✅ Enabled'],
            ].map(([field, lbl]) => (
              <label key={field} className={styles.checkLabel}>
                <input type="checkbox" checked={!!form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))} />
                {lbl}
              </label>
            ))}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={closeModal}>Cancel</button>
            <button type="submit" className={styles.btnSave}>
              {modalType === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Modal ── */}
      <Modal isOpen={modalType === 'view'} onClose={closeModal} title="Product Details" size="lg">
        {selected && (
          <div className={styles.viewBody}>
            <div className={styles.viewImages}>
              {(selected.images || []).map((src, i) => (
                <img key={i} src={src} alt="" className={styles.viewImg} />
              ))}
              {(!selected.images || selected.images.length === 0) && (
                <div className={styles.noImg}>No images</div>
              )}
            </div>
            <div className={styles.viewDetails}>
              <h2 className={styles.viewName}>{selected.name}</h2>
              <p className={styles.viewMeta}>Category: <strong>{selected.category}</strong></p>
              <p className={styles.viewMeta}>Price: <strong>{fmt(selected.price)}</strong>
                {selected.originalPrice && <span className={styles.origPrice}> ({fmt(selected.originalPrice)})</span>}
              </p>
              <p className={styles.viewMeta}>Stock: <strong>{selected.stock}</strong></p>
              <p className={styles.viewMeta}>Rating: <strong>{selected.rating} ★ ({selected.reviews} reviews)</strong></p>
              <p className={styles.viewMeta}>Featured: <strong>{selected.isFeatured ? 'Yes' : 'No'}</strong></p>
              <p className={styles.viewMeta}>Customizable: <strong>{selected.customizable ? 'Yes' : 'No'}</strong></p>
              {selected.description && <p className={styles.viewDesc}>{selected.description}</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Delete Product" size="sm">
        {selected && (
          <div className={styles.deleteBody}>
            <p>Are you sure you want to delete <strong>{selected.name}</strong>? This action cannot be undone.</p>
            <div className={styles.formActions}>
              <button className={styles.btnCancel} onClick={closeModal}>Cancel</button>
              <button className={styles.btnDanger} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
