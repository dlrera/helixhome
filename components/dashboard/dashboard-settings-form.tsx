"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useBudgetSettings, useUpdateBudget } from "@/lib/hooks/use-dashboard";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const budgetFormSchema = z.object({
  maintenanceBudget: z.string().min(1, "Budget is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Budget must be a positive number" }
  ),
  budgetStartDate: z.date({ message: "Budget start date is required" }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function DashboardSettingsForm() {
  const { data: currentSettings, isLoading: isLoadingSettings } = useBudgetSettings();
  const updateBudget = useUpdateBudget();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      maintenanceBudget: currentSettings?.maintenanceBudget?.toString() || "",
      budgetStartDate: currentSettings?.budgetStartDate
        ? new Date(currentSettings.budgetStartDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    },
    values: currentSettings ? {
      maintenanceBudget: currentSettings.maintenanceBudget?.toString() || "",
      budgetStartDate: currentSettings.budgetStartDate
        ? new Date(currentSettings.budgetStartDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    } : undefined,
  });

  const onSubmit = async (data: BudgetFormValues) => {
    updateBudget.mutate({
      maintenanceBudget: parseFloat(data.maintenanceBudget),
      budgetStartDate: data.budgetStartDate.toISOString(),
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="maintenanceBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Budget Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    placeholder="500.00"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Set your monthly maintenance budget. You'll receive alerts when spending approaches this limit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetStartDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Budget Start Date</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The date your budget tracking period begins. Typically the first of the month.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {currentSettings?.maintenanceBudget ? (
              <span>
                Current budget: <strong className="text-foreground">${currentSettings.maintenanceBudget.toFixed(2)}/month</strong>
              </span>
            ) : (
              <span>No budget set yet</span>
            )}
          </div>
          <Button
            type="submit"
            disabled={updateBudget.isPending || !form.formState.isDirty}
          >
            {updateBudget.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
