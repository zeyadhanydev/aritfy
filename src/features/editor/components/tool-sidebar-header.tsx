import React from 'react'
interface ToolSidebarHeaderProps {
    title: string;
    description?: string;
}
export const ToolSidebarHeader= ({title, description}: ToolSidebarHeaderProps) => {
  return (
    <div className='p-4 pr-12 md:pr-4 border-b space-y-1 min-h-[68px] shrink-0'>
        <p className='text-sm font-medium'>{title}</p>
        {
            description && (
                <p className='text-muted-foreground text-xs'>{description}</p>
            )}
        
    </div>
  )
}
