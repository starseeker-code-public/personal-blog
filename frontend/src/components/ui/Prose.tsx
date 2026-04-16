import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface ProseProps {
  children: string
}

export function Prose({ children }: ProseProps) {
  return (
    <div className="prose prose-invert prose-indigo prose-lg max-w-none font-serif
      prose-headings:font-sans prose-headings:tracking-tight
      prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
      prose-code:text-indigo-300 prose-code:bg-slate-800/60 prose-code:rounded prose-code:px-1
      prose-pre:bg-transparent prose-pre:p-0
      prose-blockquote:border-indigo-500 prose-blockquote:text-slate-400
      prose-hr:border-white/10
      prose-img:rounded-xl prose-img:border prose-img:border-white/10">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
