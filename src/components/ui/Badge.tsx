import clsx from 'clsx'
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx('badge', className)} {...props} />
}
