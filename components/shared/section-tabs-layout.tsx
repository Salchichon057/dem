'use client'

import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, BarChart3, FileText, Lock } from 'lucide-react'

export type TabType = 'estadistica' | 'formularios' | 'plantillas'

interface Tab {
  id: TabType
  label: string
  icon: ReactNode
  disabled?: boolean
  locked?: boolean
  content: ReactNode
}

interface SectionTabsLayoutProps {
  title: string
  description: string
  tabs: Tab[]
  defaultTab?: TabType
  showFormularios?: boolean // Mostrar tab de formularios solo si existen
}

export default function SectionTabsLayout({
  title,
  description,
  tabs,
  defaultTab,
  showFormularios = true
}: SectionTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || tabs[0]?.id)

  // Filtrar tabs según configuración
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'formularios' && !showFormularios) return false
    return true
  })

  const currentTab = visibleTabs.find(tab => tab.id === activeTab) || visibleTabs[0]

  const getIconForTab = (tabId: TabType) => {
    switch (tabId) {
      case 'estadistica':
        return <BarChart3 className="w-5 h-5" />
      case 'formularios':
        return <FileText className="w-5 h-5" />
      case 'plantillas':
        return <Table className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-purple-200">
        {visibleTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`gap-2 ${
              activeTab === tab.id 
                ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
                : 'hover:bg-purple-50'
            }`}
          >
            {tab.icon || getIconForTab(tab.id)}
            {tab.label}
            {tab.locked && <Lock className="w-3 h-3 ml-1" />}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {currentTab?.locked ? (
          <Card className="p-12 text-center border-purple-200 bg-linear-to-br from-purple-50/50 to-blue-50/50">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-linear-to-br from-purple-100 to-blue-100 p-6 rounded-full">
                <Lock className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Sección Bloqueada
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Esta sección no tiene datos disponibles actualmente. 
                  Será desbloqueada automáticamente cuando se registren datos en el sistema.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          currentTab?.content
        )}
      </div>
    </div>
  )
}
