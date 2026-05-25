import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ trail }: { trail: BreadcrumbItem[] }) {
  return (
    <nav className="rt-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {trail.map((item, i) => (
          <li key={i}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            {i < trail.length - 1 && <span aria-hidden> · </span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
