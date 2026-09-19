import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5">
      <span className="text-lg font-medium tracking-tight">
        MiniMovie
      </span>

      <div className="flex items-center gap-6 text-sm text-neutral-600">
        <Link href="/discover" className="hover:text-neutral-900">
          发现
        </Link>

        <Link href="/my" className="hover:text-neutral-900">
          我的
        </Link>

        <Link href="/login" className="hover:text-neutral-900">
          登录
        </Link>
      </div>
    </nav>
  );
}