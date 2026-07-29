export function Footer() {
  return (
    <footer>
      <div className="fw">
        <span>Homille 中古物件EC（画面イメージ）</span>
        <span className="sp"></span>
        {/* 写真・イラスト both listed while some records still fall back
            to the SVG art. Drops to 写真 only once every room type has
            a complete image set. */}
        <span>本モックアップは提案説明用に作成したものです。掲載情報・写真・イラストはすべて架空のサンプルです。</span>
        {/* Required by the Unsplash API guidelines. Per-photo photographer
            credit is available in PHOTO_CREDITS but is not yet rendered. */}
        <span>
          物件写真は{' '}
          <a href="https://unsplash.com?utm_source=homille&utm_medium=referral"
             target="_blank" rel="noopener noreferrer">Unsplash</a>
          {' '}の写真家による作品です。
        </span>
        <span>© 2026 DreamHanks Co., Ltd.</span>
      </div>
    </footer>
  )
}
