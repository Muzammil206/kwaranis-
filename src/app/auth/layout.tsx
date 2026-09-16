export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-gray-100 overflow-hidden mb-4 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="NIS Kwara" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nigeria Institution of Surveyors</h1>
          <p className="text-sm text-gray-500 mt-1">Kwara State Branch — Payment System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
