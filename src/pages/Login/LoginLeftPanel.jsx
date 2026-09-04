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
        <img src="/logo.svg" alt="GILAM" className="h-8 w-auto self-start" />

        <div className="flex flex-1 flex-col justify-center gap-5">
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
            className="max-w-[436px]"
            style={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '22px',
              letterSpacing: 0,
              color: '#FFFFFF9E',
            }}
          >
            Partiya, shtrix kod, qoldiq m² va kassa — bitta tizimda. Kirish uchun
            administrator bergan login va parolni kiriting.
          </p>
        </div>
      </div>
    </div>
  )
}
