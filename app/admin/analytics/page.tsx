'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { MetricCard } from '@/components/admin/metric-card'
import { AdminChartCard, ChartPlaceholder } from '@/components/admin/admin-chart-card'
import {
  FunnelChart,
  PopularColorsChart,
  ProductPerformanceTable,
  AbandonmentInsights,
  InsightsPanel,
  GarmentAreasChart,
  CustomizationTypesChart,
} from '@/components/admin/analytics'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Brush,
  Download,
  Eye,
  MousePointerClick,
  Percent,
  ShoppingCart,
  TrendingDown,
  Wallet,
} from 'lucide-react'

// TODO: Replace with TanStack Query useQuery for real design_events analytics
const MOCK_METRICS = {
  designsCreated: { value: 2847, change: { value: 12.5, type: 'increase' as const } },
  designsAddedToCart: { value: 1423, change: { value: 8.3, type: 'increase' as const } },
  designsPurchased: { value: 892, change: { value: 15.2, type: 'increase' as const } },
  conversionRate: { value: 31.3, change: { value: 2.1, type: 'increase' as const } },
  avgDesignValue: { value: 1847, change: { value: -3.2, type: 'decrease' as const } },
  customizerAbandonment: { value: 42.8, change: { value: -5.4, type: 'increase' as const } },
}

const MOCK_FUNNEL = [
  { label: 'Disenos creados', value: 2847, color: '#2B3280' },
  { label: 'Disenos editados', value: 2156, color: '#3B4CC0' },
  { label: 'Agregados al carrito', value: 1423, color: '#6366F1' },
  { label: 'Comprados', value: 892, color: '#22C55E' },
]

const MOCK_GARMENT_AREAS = [
  { name: 'Pecho', count: 1834, percentage: 64 },
  { name: 'Espalda', count: 723, percentage: 25 },
  { name: 'Manga Izquierda', count: 412, percentage: 14 },
  { name: 'Manga Derecha', count: 189, percentage: 7 },
  { name: 'Bolsillo', count: 156, percentage: 5 },
]

const MOCK_COLORS = [
  { name: 'Azul Chef Room', hex: '#2B3280', count: 892, percentage: 31 },
  { name: 'Blanco', hex: '#FFFFFF', count: 756, percentage: 27 },
  { name: 'Negro', hex: '#111111', count: 634, percentage: 22 },
  { name: 'Azul Marino', hex: '#0B1026', count: 412, percentage: 14 },
  { name: 'Gris', hex: '#6B7280', count: 153, percentage: 5 },
]

const MOCK_CUSTOMIZATION_TYPES = [
  { name: 'Bordado', icon: 'needle', count: 1523, percentage: 53 },
  { name: 'Logo', icon: 'image', count: 845, percentage: 30 },
  { name: 'Texto', icon: 'type', count: 367, percentage: 13 },
  { name: 'Patch', icon: 'square', count: 112, percentage: 4 },
]

const MOCK_PRODUCT_PERFORMANCE = [
  {
    id: '1',
    name: 'Filipina Executive Blanca',
    category: 'filipinas',
    designsCreated: 1245,
    addedToCart: 623,
    purchased: 412,
    conversion: 33.1,
    avgCustomizationValue: 1987,
    popularColor: { name: 'Azul Chef Room', hex: '#2B3280' },
  },
  {
    id: '2',
    name: 'Mandil Profesional Chef',
    category: 'mandiles',
    designsCreated: 834,
    addedToCart: 412,
    purchased: 234,
    conversion: 28.1,
    avgCustomizationValue: 1456,
    popularColor: { name: 'Negro', hex: '#111111' },
  },
  {
    id: '3',
    name: 'Filipina Slim Fit Negra',
    category: 'filipinas',
    designsCreated: 523,
    addedToCart: 267,
    purchased: 178,
    conversion: 34.0,
    avgCustomizationValue: 2134,
    popularColor: { name: 'Blanco', hex: '#FFFFFF' },
  },
  {
    id: '4',
    name: 'Mandil Bistro Premium',
    category: 'mandiles',
    designsCreated: 245,
    addedToCart: 121,
    purchased: 68,
    conversion: 27.8,
    avgCustomizationValue: 1678,
    popularColor: { name: 'Azul Marino', hex: '#0B1026' },
  },
]

const MOCK_ABANDONMENT_INSIGHTS = [
  {
    id: '1',
    title: 'Paso mas abandonado',
    value: 'Subir logo',
    description: '34% de usuarios abandonan al intentar subir su logo',
    icon: 'image' as const,
    severity: 'critical' as const,
  },
  {
    id: '2',
    title: 'Tiempo promedio en customizador',
    value: '4:32 min',
    description: 'Usuarios que completan gastan 6:15 min en promedio',
    icon: 'time' as const,
    severity: 'info' as const,
  },
  {
    id: '3',
    title: 'Abandono por precio',
    value: '18%',
    description: 'Abandonan al ver el precio final de personalizacion',
    icon: 'price' as const,
    severity: 'warning' as const,
  },
  {
    id: '4',
    title: 'Error de formato de imagen',
    value: '12%',
    description: 'Suben imagenes en formato no soportado',
    icon: 'image' as const,
    severity: 'warning' as const,
  },
]

const MOCK_INSIGHTS = [
  {
    id: '1',
    text: 'El azul Chef Room es uno de los colores mas seleccionados, considera destacarlo en la UI del customizador.',
    type: 'positive' as const,
  },
  {
    id: '2',
    text: 'El pecho es el area de personalizacion mas usada. Asegurate de que sea la opcion predeterminada.',
    type: 'neutral' as const,
  },
  {
    id: '3',
    text: 'Los usuarios que suben logotipo tienen 2.3x mayor intencion de compra. Facilita este proceso.',
    type: 'actionable' as const,
  },
  {
    id: '4',
    text: 'Las filipinas generan mas disenos guardados que otros productos. Considera campanas especificas.',
    type: 'positive' as const,
  },
]

export default function CustomizerAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')

  return (
    <AdminLayout breadcrumb={[{ label: 'Analytics' }]}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">
            Analytics de personalizacion
          </h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Entiende como los clientes disenan, guardan y compran sus uniformes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ultimos 7 dias</SelectItem>
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="90d">Ultimos 90 dias</SelectItem>
              <SelectItem value="12m">Ultimo ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Disenos creados"
          value={MOCK_METRICS.designsCreated.value.toLocaleString()}
          icon={<Brush className="h-5 w-5" />}
          change={MOCK_METRICS.designsCreated.change}
        />
        <MetricCard
          title="Agregados al carrito"
          value={MOCK_METRICS.designsAddedToCart.value.toLocaleString()}
          icon={<ShoppingCart className="h-5 w-5" />}
          change={MOCK_METRICS.designsAddedToCart.change}
        />
        <MetricCard
          title="Disenos comprados"
          value={MOCK_METRICS.designsPurchased.value.toLocaleString()}
          icon={<MousePointerClick className="h-5 w-5" />}
          change={MOCK_METRICS.designsPurchased.change}
        />
        <MetricCard
          title="Tasa de conversion"
          value={`${MOCK_METRICS.conversionRate.value}%`}
          icon={<Percent className="h-5 w-5" />}
          change={MOCK_METRICS.conversionRate.change}
        />
        <MetricCard
          title="Valor prom. diseno"
          value={`$${MOCK_METRICS.avgDesignValue.value.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          change={MOCK_METRICS.avgDesignValue.change}
        />
        <MetricCard
          title="Abandono customizador"
          value={`${MOCK_METRICS.customizerAbandonment.value}%`}
          icon={<TrendingDown className="h-5 w-5" />}
          change={MOCK_METRICS.customizerAbandonment.change}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <AdminChartCard
          title="Disenos creados en el tiempo"
          description="Tendencia de creacion de disenos"
        >
          <ChartPlaceholder height={240} type="line" label="Grafico de linea temporal" />
        </AdminChartCard>

        <AdminChartCard
          title="Funnel de conversion"
          description="De diseno creado a compra"
        >
          <FunnelChart steps={MOCK_FUNNEL} />
        </AdminChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <AdminChartCard
          title="Areas de prenda mas usadas"
          description="Donde personalizan los usuarios"
        >
          <GarmentAreasChart areas={MOCK_GARMENT_AREAS} />
        </AdminChartCard>

        <AdminChartCard
          title="Colores mas populares"
          description="Colores seleccionados en personalizacion"
        >
          <PopularColorsChart colors={MOCK_COLORS} />
        </AdminChartCard>

        <AdminChartCard
          title="Tipos de personalizacion"
          description="Bordado, logo, texto, patch"
        >
          <CustomizationTypesChart types={MOCK_CUSTOMIZATION_TYPES} />
        </AdminChartCard>
      </div>

      {/* Product Performance Table */}
      <div className="mb-8">
        <AdminChartCard
          title="Rendimiento por producto"
          description="Metricas de personalizacion por producto"
        >
          <ProductPerformanceTable products={MOCK_PRODUCT_PERFORMANCE} />
        </AdminChartCard>
      </div>

      {/* Abandonment Insights */}
      <div className="mb-8">
        <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
          Insights de abandono
        </h2>
        <AbandonmentInsights insights={MOCK_ABANDONMENT_INSIGHTS} />
      </div>

      {/* Recommendations Panel */}
      <InsightsPanel insights={MOCK_INSIGHTS} />
    </AdminLayout>
  )
}
