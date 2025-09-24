import clsx from 'clsx'
export function Button({ variant = 'brand', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'brand' | 'ghost' }) {
  return <button className={clsx('btn', variant === 'brand' ? 'btn-brand' : 'btn-ghost', className)} {...props} />
}
