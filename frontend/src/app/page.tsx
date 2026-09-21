import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24">
      <div className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-accent">
          电影手帐
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          MiniMovie
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          一个简洁的电影发现与影评应用。浏览精选影片，收藏你喜欢的作品，
          并记录下真实的观影感受。适合作为全栈作品集项目：包含 JWT 认证、
          REST API、PostgreSQL 持久化，以及受保护的个人数据。
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/discover"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          去发现电影
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-100"
        >
          登录账号
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">发现</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            浏览电影列表，查看海报、中英文片名和上映年份。
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">收藏</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            登录后收藏喜欢的电影，并在「我的」页面管理收藏。
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">影评</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            为每部电影写下一条影评，之后可以编辑或删除。
          </p>
        </article>
      </section>
    </main>
  );
}
