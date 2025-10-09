import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * WidgetContainer - Reusable container for dashboard widgets
 * Provides consistent styling, loading states, and error handling
 */
export function WidgetContainer({
  title,
  description,
  children,
  className,
  headerAction,
  isLoading = false,
  error = null,
}: WidgetContainerProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {headerAction && <div className="flex items-center">{headerAction}</div>}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-destructive font-medium">Error loading data</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
