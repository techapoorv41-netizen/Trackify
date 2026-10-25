import Modal from '@/components/common/Modal';

export default function ConfirmationDialog({
  open, onCancel, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  tone = 'primary', children, confirmDisabled = false, loading = false,
}) {
  const cls = tone === 'danger' ? 'btn-danger' : tone === 'success' ? 'btn-success' : 'btn-primary';
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" data-autofocus className={`btn ${cls}`} onClick={onConfirm} disabled={confirmDisabled || loading}>
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
