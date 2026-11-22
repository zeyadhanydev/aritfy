import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
 icon: LucideIcon;
 label: string;
 isActive?: boolean;
 disabled?: boolean;
} & ({ href: Route; onClick?: never } | { href?: never; onClick: () => void });

export const SidebarItem = ({ icon: Icon, label, href, isActive, onClick, disabled }: SidebarItemProps) => {
 const className = cn("w-full flex items-center px-3 py-3 rounded-xl bg-background/20 hover:bg-white dark:hover:bg-background/50 transition", isActive && "bg-background");
 const content = <><Icon className="size-4 stroke-2 mr-2" /><span className="text-sm font-medium">{label}</span></>;
 return href ? <Link href={href} className={className}>{content}</Link> : <button type="button" disabled={disabled} onClick={onClick} className={className}>{content}</button>;
};
