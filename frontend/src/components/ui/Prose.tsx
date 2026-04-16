import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface ProseProps {
  children: string
}

export function Prose({ children }: ProseProps) {
  return (
    <div className="prose prose-stone prose-lg max-w-none font-serif
      dark:prose-invert
      prose-headings:font-sans prose-headings:tracking-tight prose-headings:text-stone-900 dark:prose-headings:text-[#f0ecfd]
      prose-p:text-stone-700 dark:prose-p:text-[#c9beed] prose-p:text-justify
      prose-a:text-[#798777] dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-stone-900 dark:prose-strong:text-[#f0ecfd]
      prose-code:text-[#798777] dark:prose-code:text-amber-300 prose-code:bg-[#d4cd9e]/70 dark:prose-code:bg-[#231f42] prose-code:rounded prose-code:px-1 prose-code:font-normal
      prose-pre:bg-transparent prose-pre:p-0
      prose-blockquote:border-[#798777] dark:prose-blockquote:border-amber-500 prose-blockquote:text-stone-600 dark:prose-blockquote:text-[#c9beed] prose-blockquote:bg-[#e4ddba]/40 dark:prose-blockquote:bg-[#1a1735]/60 prose-blockquote:rounded-r-lg
      prose-hr:border-stone-300 dark:prose-hr:border-[#322d5a]
      prose-img:rounded-xl prose-img:border prose-img:border-stone-200 dark:prose-img:border-[#322d5a]
      prose-li:text-stone-700 dark:prose-li:text-[#c9beed]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
