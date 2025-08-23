"use client";

import dynamic from 'next/dynamic';
import { EditorLoading } from '@/components/editor-loading';

// Dynamically import the Editor component with SSR disabled
const EditorComponent = dynamic(() => import('./editor').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => <EditorLoading />
});

export const EditorWrapper = () => {
  return <EditorComponent />;
};
