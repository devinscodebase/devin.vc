import { DocumentRenderer } from '@keystatic/core/renderer';

export default function PostContent({ document }: { document: any }) {
  return <DocumentRenderer document={document} />;
}
