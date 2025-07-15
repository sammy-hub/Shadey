import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingUp, Package, Clock, Plus, Palette, Users } from "lucide-react";

// Mock data for charts
const inventoryData = [
  { name: "Blonde", stock: 45, lowStock: false },
  { name: "Brunette", stock: 32, lowStock: false },
  { name: "Red", stock: 8, lowStock: true },
  { name: "Black", stock: 28, lowStock: false },
  { name: "Highlights", stock: 5, lowStock: true },
  { name: "Ombre", stock: 22, lowStock: false },
];

const brandData = [
  { name: "L'Oréal", value: 40, color: "hsl(var(--salon-purple))" },
  { name: "Wella", value: 30, color: "hsl(var(--salon-teal))" },
  { name: "Redken", value: 20, color: "hsl(var(--salon-gold))" },
  { name: "Matrix", value: 10, color: "hsl(var(--salon-sage))" },
];

const recentFormulas = [
  { client: "Sarah Johnson", date: "2024-01-15", colors: ["Blonde 9A", "Toner T18"], cost: 28.50 },
  { client: "Emily Davis", date: "2024-01-14", colors: ["Red 6R", "Developer 30"], cost: 32.75 },
  { client: "Maria Garcia", date: "2024-01-13", colors: ["Brunette 4N", "Gloss"], cost: 24.25 },
];

export default function Dashboard() {
  const totalInventoryValue = 2450.75;
  const lowStockItems = inventoryData.filter(item => item.lowStock).length;
  const thisMonthFormulas = 47;
  const avgFormulasCost = 29.83;

  return (
    <div className="space-premium-lg animate-fade-in">
      {/* Hero Header */}
      <div className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-gradient tracking-tight mb-2">Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Welcome back! Here's your salon overview
            </p>
          </div>
          <div className="mt-6 sm:mt-0">
            <Button size="lg" className="btn-gradient shadow-colored hover:shadow-glow">
              <Plus className="mr-2 h-5 w-5" />
              Quick Add
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Inventory</p>
              <p className="text-4xl font-bold text-gradient mb-1">${totalInventoryValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">+12% this month</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-primary text-white group-hover:scale-110 transition-transform duration-200">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-glass group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Low Stock</p>
              <p className="text-4xl font-bold text-destructive mb-1">{lowStockItems}</p>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-warm text-white group-hover:scale-110 transition-transform duration-200">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-glass group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">This Month</p>
              <p className="text-4xl font-bold text-gradient-secondary mb-1">{thisMonthFormulas}</p>
              <p className="text-xs text-muted-foreground">Formulas created</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-accent text-white group-hover:scale-110 transition-transform duration-200">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-glass group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Avg Cost</p>
              <p className="text-4xl font-bold text-gradient mb-1">${avgFormulasCost}</p>
              <p className="text-xs text-muted-foreground">Per service</p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-secondary text-white group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="card-glass">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Stock Levels</h3>
              <p className="text-muted-foreground">Track your inventory status</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/50">
              View All
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
              <Bar 
                dataKey="stock" 
                fill="url(#stockGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--premium-blue))" />
                  <stop offset="100%" stopColor="hsl(var(--premium-teal))" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-glass">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Brand Distribution</h3>
              <p className="text-muted-foreground">Breakdown by brand</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/50">
              Manage
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={brandData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Recent Formulas</h3>
            <p className="text-muted-foreground">Latest client color formulas</p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/50">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {recentFormulas.map((formula, index) => (
            <div key={index} className="flex items-center justify-between p-6 rounded-2xl bg-white/50 hover:bg-white/70 transition-all duration-200 interactive-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {formula.client.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{formula.client}</p>
                  <p className="text-sm text-muted-foreground mb-2">{formula.date}</p>
                  <div className="flex gap-2">
                    {formula.colors.map((color, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs rounded-xl bg-white/70">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gradient">${formula.cost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total cost</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}