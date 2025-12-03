import SettingsSidebar from '@/components/settings/settings-sidebar'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <SettingsSidebar />
        </aside>

        {/* Settings Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
