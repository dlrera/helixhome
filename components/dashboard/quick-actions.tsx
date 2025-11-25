'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wrench } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/assets/new" className="flex-1">
            <Button className="w-full bg-[#216093] hover:bg-[#1a4d75]">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </Link>
          <Link href="/tasks?create=true" className="flex-1">
            <Button variant="outline" className="w-full">
              <Wrench className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
