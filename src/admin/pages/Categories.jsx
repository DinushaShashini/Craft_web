import { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import PageHeader from '../components/PageHeader';
import AdminTable from '../components/AdminTable';
import Modal from '../components/Modal';
import styles from './Categories.module.css';

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: '', description: '', icon: '📦', color: '#C9785A', bgColor: '#FFF7ED' };

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(c => !q || c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() { setForm(EMPTY_FORM); setModalType('add'); }
  function openEdit(c) { setSelected(c); setForm({ name: c.name, description: c.description, icon: c.icon, color: c.color, bgColor: c.bgColor }); setModalType('edit'); }
  function openDelete(c) { setSelected(c); setModalType('delete'); }
  function closeModal() { setModalType(null); setSelected(null); }

  function handleSubmit(e) {
    e.preventDefault();
    if (modalType === 'add') addCategory(form);
    else updateCategory(selected.id, form);
    closeModal();
  }

  const columns = [
    {
      key: 'icon', label: 'Icon',
      render: (icon, c) => (
        <span className={styles.iconBadge} style={{ background: c.bgColor, color: c.color }}>
          {icon}
        </span>
      ),
    },
    { key: 'name', label: 'Name', render: n => <strong>{n}</strong> },
    { key: 'description', label: 'Description' },
    { key: 'count', label: 'Products', render: n => <span className={styles.count}>{n}</span> },
    {
      key: 'id', label: 'Actions',
      render: (_, c) => (
        <div className={styles.actions}>
          <button className={styles.btnEdit} onClick={() => openEdit(c)}>Edit</button>
          <button className={styles.btnDelete} onClick={() => openDelete(c)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<button className={styles.addBtn} onClick={openAdd}>+ Add Category</button>}
      />

      <AdminTable
        columns={columns}
        rows={paged}
        total={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        search={search}
        onSearch={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search categories…"
      />

      <Modal isOpen={modalType === 'add' || modalType === 'edit'} onClose={closeModal}
        title={modalType === 'add' ? 'Add Category' : 'Edit Category'} size="sm">
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Name *</label>
          <input required className={styles.input} value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label className={styles.label}>Description</label>
          <textarea rows={2} className={styles.textarea} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className={styles.row3}>
            <div>
              <label className={styles.label}>Icon (emoji)</label>
              <input className={styles.input} value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className={styles.label}>Color</label>
              <input type="color" className={styles.colorInput} value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            <div>
              <label className={styles.label}>BG Color</label>
              <input type="color" className={styles.colorInput} value={form.bgColor}
                onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={closeModal}>Cancel</button>
            <button type="submit" className={styles.btnSave}>{modalType === 'add' ? 'Add' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'delete'} onClose={closeModal} title="Delete Category" size="sm">
        {selected && (
          <div className={styles.deleteBody}>
            <p>Delete category <strong>{selected.name}</strong>? This cannot be undone.</p>
            <div className={styles.formActions}>
              <button className={styles.btnCancel} onClick={closeModal}>Cancel</button>
              <button className={styles.btnDanger} onClick={() => { deleteCategory(selected.id); closeModal(); }}>Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
