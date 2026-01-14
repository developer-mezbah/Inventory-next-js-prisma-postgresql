"use client"

export default function TabsNav({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex border-b border-border/50 bg-card px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? "border-blue-500 text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    style={activeTab === tab.id ? { borderBottomColor: '#3b82f6', borderBottomWidth: '2px' } : { borderBottomColor: 'transparent' }}
                >
                    <span>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
