'use client'
export default function DeleteButton({ boardId, docId }: { boardId: number, docId: number }) {
  async function onDelete() {
    if (!confirm('Delete this document?')) return
    const res = await fetch(`/api/admin/boards/${boardId}/docs/${docId}`, { method: 'DELETE' })
    if (res.ok) location.reload()
    else alert('Delete failed')
  }
  return <button className="btn-ghost" onClick={onDelete}>Delete</button>
}
