"use client"

import * as React from "react"
import { Area, Bar, CartesianGrid, Line, Pie, Scatter, Tooltip, XAxis, YAxis } from "recharts" // Import Area and Bar

import { cn } from "@/lib/utils"

// region ChartContext
type ChartContextProps = {
  config: ChartConfig
  children: React.ReactNode
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function ChartProvider({ config, children }: ChartContextProps) {
  return <ChartContext.Provider value={{ config, children }}>{children}</ChartContext.Provider>
}

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartProvider>")
  }
  return context
}
// endregion

// region ChartContainer
type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactElement | React.ReactElement[]
  config: ChartConfig
  className?: string
}

function ChartContainer({ children, config, className, ...props }: ChartContainerProps) {
  const id = React.useId()
  return (
    <ChartProvider config={config}>
      <div
        data-chart={id}
        className={cn(
          "flex aspect-video justify-center text-foreground [&>.recharts-responsive-container]:w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ChartProvider>
  )
}
// endregion

// region ChartTooltip
// Omit 'children' from the inherited Tooltip props as this component is used as 'content'
type ChartTooltipProps = Omit<React.ComponentPropsWithoutRef<typeof Tooltip>, "children"> & {
  hideIndicator?: boolean
  hideLabel?: boolean
  formatter?: (
    value: number | string,
    name: string,
    props: { payload: any; dataKey: string },
  ) => [string, string] | string
  className?: string // Keep className as it's used on the inner div
}

function ChartTooltip({
  hideIndicator = false,
  hideLabel = false,
  formatter,
  className,
  // Removed children from destructuring as it's omitted from props
  ...props
}: ChartTooltipProps) {
  const { config } = useChart()

  return (
    <Tooltip
      cursor={false}
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          return (
            <div
              className={cn(
                "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-md",
                className,
              )}
            >
              {!hideLabel && payload[0] ? <div className="font-medium">{payload[0].name}</div> : null}
              <div className="grid gap-1.5">
                {payload.map((item, i) => {
                  const key = `${item.dataKey}-${i}`
                  const configLabel = item.dataKey && (config[item.dataKey as keyof ChartConfig]?.label || item.dataKey)
                  const value = formatter
                    ? formatter(item.value!, item.name!, {
                        payload: item.payload,
                        dataKey: item.dataKey!,
                      })
                    : item.value

                  return (
                    <div key={key} className="flex items-center justify-between gap-4">
                      {item.dataKey ? (
                        <div className="flex items-center gap-2">
                          {!hideIndicator && (
                            <span
                              className="flex h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                          )}
                          {/* Changed Label to span for display purposes */}
                          <span>{configLabel}</span>
                        </div>
                      ) : (
                        <div className="flex-1 text-left">{item.name}</div>
                      )}
                      <div className="font-mono text-right">
                        {typeof value === "string" ? value : value?.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return null
      }}
      {...props}
    >
      {/* No children here, as this component is the `content` renderer */}
    </Tooltip>
  )
}
// endregion

// region ChartTooltipContent
// ChartTooltipContent is just a wrapper for ChartTooltip, so its props should match ChartTooltip's props
type ChartTooltipContentProps = ChartTooltipProps

function ChartTooltipContent(props: ChartTooltipContentProps) {
  return <ChartTooltip {...props} />
}
// endregion

// region ChartLegend
// Corrected: Extend React.HTMLAttributes<HTMLDivElement> directly
type ChartLegendProps = React.HTMLAttributes<HTMLDivElement> & {
  content?: React.ReactNode // Use React.ReactNode for content
  className?: string
}

function ChartLegend({ content, className, ...props }: ChartLegendProps) {
  const { config } = useChart()

  if (!content) return null

  return (
    <div
      className={cn("flex items-center justify-center gap-4 px-2 text-xs font-medium text-muted-foreground", className)}
      {...props}
    >
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{
              backgroundColor: `hsl(var(${item.color}))`,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  )
}
// endregion

// region ChartLegendContent
type ChartLegendContentProps = React.ComponentPropsWithoutRef<typeof ChartLegend>

function ChartLegendContent(props: ChartLegendContentProps) {
  return <ChartLegend {...props} />
}
// endregion

// region ChartCrosshair
type ChartCrosshairProps = React.ComponentPropsWithoutRef<typeof CartesianGrid> & {
  className?: string
}

function ChartCrosshair({ className, ...props }: ChartCrosshairProps) {
  return <CartesianGrid className={cn("stroke-border stroke-dasharray-3", className)} vertical={false} {...props} />
}
// endregion

// region ChartAxis
type ChartAxisProps = React.ComponentPropsWithoutRef<typeof XAxis> & {
  className?: string
}

function ChartAxis({ className, ...props }: ChartAxisProps) {
  return (
    <XAxis axisLine={false} tickLine={false} className={cn("fill-muted-foreground text-xs", className)} {...props} />
  )
}
// endregion

// region ChartAxisY
type ChartAxisYProps = React.ComponentPropsWithoutRef<typeof YAxis> & {
  className?: string
}

function ChartAxisY({ className, ...props }: ChartAxisYProps) {
  return (
    <YAxis axisLine={false} tickLine={false} className={cn("fill-muted-foreground text-xs", className)} {...props} />
  )
}
// endregion

// region ChartLine
type ChartLineProps = React.ComponentPropsWithoutRef<typeof Line> & {
  className?: string
}

function ChartLine({ className, ...props }: ChartLineProps) {
  return (
    <Line dot={false} strokeWidth={2} className={cn("stroke-primary", className)} {...props} /> // Removed radius
  )
}
// endregion

// region ChartBar
type ChartBarProps = React.ComponentPropsWithoutRef<typeof Bar> & {
  // Changed to Bar
  className?: string
}

function ChartBar({ className, ...props }: ChartBarProps) {
  return (
    <Bar radius={[4, 4, 0, 0]} className={cn("fill-primary", className)} {...props} /> // Used Bar, kept radius
  )
}
// endregion

// region ChartArea
type ChartAreaProps = React.ComponentPropsWithoutRef<typeof Area> & {
  // Changed to Area
  className?: string
}

function ChartArea({ className, ...props }: ChartAreaProps) {
  return (
    <Area dot={false} strokeWidth={2} className={cn("fill-primary stroke-primary", className)} {...props} /> // Used Area, removed radius
  )
}
// endregion

// region ChartScatter
type ChartScatterProps = React.ComponentPropsWithoutRef<typeof Scatter> & {
  className?: string
}

function ChartScatter({ className, ...props }: ChartScatterProps) {
  return <Scatter className={cn("fill-primary", className)} {...props} />
}
// endregion

// region ChartPie
type ChartPieProps = React.ComponentPropsWithoutRef<typeof Pie> & {
  className?: string
}

function ChartPie({ className, ...props }: ChartPieProps) {
  return <Pie className={cn("fill-primary", className)} {...props} />
}
// endregion

// region ChartConfig
type ChartConfig = {
  [key: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
}
// endregion

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartCrosshair,
  ChartAxis,
  ChartAxisY,
  ChartLine,
  ChartBar,
  ChartArea,
  ChartScatter,
  ChartPie,
  type ChartConfig,
}
