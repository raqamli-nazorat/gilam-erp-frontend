export default function LoginLeftPanel() {
  return (
    <div
      className="relative hidden shrink-0 overflow-hidden bg-cover bg-center bg-no-repeat md:block"
      style={{
        width: 500,
        height: 620,
        borderRadius: 20,
        fontFamily: "'Onest Variable', sans-serif",
        backgroundImage: "url('/login-bg.png')",
      }}
    >
      <div className="relative flex h-full flex-col p-10">
        <img src="/logo.svg" alt="GILAM" className="h-8 w-auto" />

        <div className="mt-auto flex flex-col gap-5">
          <div
            className="inline-flex w-fit items-center gap-2 backdrop-blur-sm"
            style={{
              height: 26,
              borderRadius: 999,
              paddingTop: 5,
              paddingRight: 12,
              paddingBottom: 5,
              paddingLeft: 10,
              background: '#FFFFFF1A',
              border: '1px solid #FFFFFF29',
            }}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <span
              className="whitespace-nowrap"
              style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: '#FFFFFFD1' }}
            >
              21 ta salon · real vaqtda
            </span>
          </div>

          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: '48px',
              letterSpacing: '-1.2px',
              color: '#FFFFFF',
            }}
          >
            Har bir rulon
            <br />
            ko‘rinib turadi
          </h1>

          <p
            className="max-w-[340px] text-white/70"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: '22px' }}
          >
            Partiya, shtrix kod, qoldiq m² va kassa — bitta tizimda. Kirish uchun
            administrator bergan login va parolni kiriting.
          </p>
        </div>
      </div>
    </div>
  )
}
