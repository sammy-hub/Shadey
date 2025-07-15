import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, Search, ArrowLeft, Edit3, Check, X, Eye, EyeOff, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ColorItem {
  id: string;
  shade: string;
  brand: string;
  ouncesPerUnit: number;
  price: number;
  costPerOunce: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface BrandSummary {
  brand: string;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  status: 'good' | 'warning' | 'critical';
}

// Mock initial data
const initialInventory: ColorItem[] = [
  {
    id: "1",
    shade: "Platinum Blonde 10A",
    brand: "L'Oréal",
    ouncesPerUnit: 2,
    price: 15.50,
    costPerOunce: 7.75,
    stockQuantity: 45,
    lowStockThreshold: 10,
  },
  {
    id: "2",
    shade: "Copper Red 6R",
    brand: "Wella",
    ouncesPerUnit: 2.1,
    price: 18.25,
    costPerOunce: 8.69,
    stockQuantity: 8,
    lowStockThreshold: 15,
  },
  {
    id: "3",
    shade: "Ash Brown 4A",
    brand: "Redken",
    ouncesPerUnit: 2,
    price: 16.75,
    costPerOunce: 8.38,
    stockQuantity: 32,
    lowStockThreshold: 10,
  },
  {
    id: "4",
    shade: "Golden Brown 5G",
    brand: "L'Oréal",
    ouncesPerUnit: 2,
    price: 15.50,
    costPerOunce: 7.75,
    stockQuantity: 0,
    lowStockThreshold: 10,
  },
  {
    id: "5",
    shade: "Medium Blonde 7N",
    brand: "Wella",
    ouncesPerUnit: 2.1,
    price: 17.00,
    costPerOunce: 8.10,
    stockQuantity: 25,
    lowStockThreshold: 15,
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState<ColorItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [hiddenRows, setHiddenRows] = useState<Set<string>>(new Set());
  const [tempEditData, setTempEditData] = useState<Partial<ColorItem>>({});
  const [brands, setBrands] = useState<string[]>(["L'Oréal", "Wella", "Redken", "Matrix", "Schwarzkopf"]);
  const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const [showDeleteBrandDialog, setShowDeleteBrandDialog] = useState(false);

  const [formData, setFormData] = useState({
    shade: "",
    brand: "",
    ouncesPerUnit: "",
    price: "",
    stockQuantity: "",
    lowStockThreshold: "",
  });

  const getBrandSummaries = (): BrandSummary[] => {
    const brandMap = new Map<string, BrandSummary>();

    inventory.forEach(item => {
      if (!brandMap.has(item.brand)) {
        brandMap.set(item.brand, {
          brand: item.brand,
          totalStock: 0,
          totalValue: 0,
          lowStockCount: 0,
          status: 'good'
        });
      }

      const summary = brandMap.get(item.brand)!;
      summary.totalStock += item.stockQuantity;
      summary.totalValue += item.price * item.stockQuantity;
      
      if (item.stockQuantity <= item.lowStockThreshold) {
        summary.lowStockCount++;
      }
    });

    // Determine status for each brand
    brandMap.forEach(summary => {
      const brandItems = inventory.filter(item => item.brand === summary.brand);
      const outOfStockCount = brandItems.filter(item => item.stockQuantity === 0).length;
      
      if (outOfStockCount > 0) {
        summary.status = 'critical';
      } else if (summary.lowStockCount > 0) {
        summary.status = 'warning';
      } else {
        summary.status = 'good';
      }
    });

    return Array.from(brandMap.values()).sort((a, b) => a.brand.localeCompare(b.brand));
  };

  const getFilteredBrandItems = () => {
    if (!selectedBrand) return [];
    
    return inventory
      .filter(item => item.brand === selectedBrand)
      .filter(item => !hiddenRows.has(item.id))
      .filter(item => item.shade.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const handleEdit = (item: ColorItem) => {
    setEditingRow(item.id);
    setTempEditData({
      shade: item.shade,
      ouncesPerUnit: item.ouncesPerUnit,
      price: item.price,
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
    });
  };

  const handleSaveEdit = () => {
    if (!editingRow || !tempEditData.price || !tempEditData.ouncesPerUnit) return;

    const costPerOunce = tempEditData.price / tempEditData.ouncesPerUnit;

    setInventory(inventory.map(item => 
      item.id === editingRow 
        ? { 
            ...item, 
            ...tempEditData,
            costPerOunce,
          } as ColorItem
        : item
    ));

    setEditingRow(null);
    setTempEditData({});
    toast({ title: "Color updated successfully!" });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setTempEditData({});
  };

  const toggleRowVisibility = (id: string) => {
    const newHidden = new Set(hiddenRows);
    if (newHidden.has(id)) {
      newHidden.delete(id);
    } else {
      newHidden.add(id);
    }
    setHiddenRows(newHidden);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const ouncesPerUnit = parseFloat(formData.ouncesPerUnit);
    const costPerOunce = price / ouncesPerUnit;

    const newItem: ColorItem = {
      id: Date.now().toString(),
      shade: formData.shade,
      brand: formData.brand,
      ouncesPerUnit,
      price,
      costPerOunce,
      stockQuantity: parseInt(formData.stockQuantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    };

    setInventory([...inventory, newItem]);
    toast({ title: "Color added successfully!" });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      shade: "",
      brand: "",
      ouncesPerUnit: "",
      price: "",
      stockQuantity: "",
      lowStockThreshold: "",
    });
    setShowAddDialog(false);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrandName.trim();
    if (!trimmed) {
      toast({ title: "Brand name cannot be empty", variant: "destructive" });
      return;
    }
    if (brands.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Brand already exists", variant: "destructive" });
      return;
    }
    setBrands([...brands, trimmed]);
    setNewBrandName("");
    setShowAddBrandDialog(false);
    toast({ title: `Brand '${trimmed}' added!` });
  };

  const handleDeleteBrand = () => {
    if (!brandToDelete) return;
    setBrands(brands.filter(b => b !== brandToDelete));
    setBrandToDelete(null);
    setShowDeleteBrandDialog(false);
    toast({ title: "Brand deleted" });
  };

  const getStatusBadge = (status: BrandSummary['status']) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
      case 'good':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Good</Badge>;
    }
  };

  if (selectedBrand) {
    const brandItems = getFilteredBrandItems();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedBrand(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Brands
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{selectedBrand} Inventory</h1>
              <p className="text-muted-foreground">Manage {selectedBrand} color shades</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-salon-purple to-salon-teal hover:from-salon-purple/90 hover:to-salon-teal/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Brand Details Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Shade</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Cost/Oz</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Total Oz</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className={`hover:bg-muted/20 ${item.stockQuantity === 0 ? 'opacity-50 bg-muted/30' : ''}`}
                    >
                      <TableCell>
                        {editingRow === item.id ? (
                          <Input
                            value={tempEditData.shade || ""}
                            onChange={(e) => setTempEditData({ ...tempEditData, shade: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <div className="font-medium">{item.shade}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={tempEditData.price || ""}
                            onChange={(e) => setTempEditData({ ...tempEditData, price: parseFloat(e.target.value) })}
                            className="h-8 w-20"
                          />
                        ) : (
                          <span className="font-semibold">${item.price.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">${item.costPerOunce.toFixed(2)}</TableCell>
                      <TableCell>
                        {editingRow === item.id ? (
                          <Input
                            type="number"
                            value={tempEditData.stockQuantity || ""}
                            onChange={(e) => setTempEditData({ ...tempEditData, stockQuantity: parseInt(e.target.value) })}
                            className="h-8 w-16"
                          />
                        ) : (
                          <>
                            <span className="font-semibold">{item.stockQuantity}</span>
                            <span className="text-muted-foreground text-sm ml-1">units</span>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {(item.stockQuantity * item.ouncesPerUnit).toFixed(1)} oz
                      </TableCell>
                      <TableCell className="font-semibold text-salon-purple">
                        ${(item.price * item.stockQuantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.stockQuantity === 0 ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Out of Stock
                          </Badge>
                        ) : item.stockQuantity <= item.lowStockThreshold ? (
                          <Badge variant="destructive" className="animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingRow === item.id ? (
                            <>
                              <Button variant="outline" size="sm" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleRowVisibility(item.id)}
                              >
                                {hiddenRows.has(item.id) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Color Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Color</DialogTitle>
              <DialogDescription>
                Add a new color to your {selectedBrand} inventory. Cost per ounce will be calculated automatically.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shade">Color Shade</Label>
                <Input
                  id="shade"
                  placeholder="e.g., Platinum Blonde 10A"
                  value={formData.shade}
                  onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select 
                  value={selectedBrand || formData.brand} 
                  onValueChange={(value) => setFormData({ ...formData, brand: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ouncesPerUnit">Ounces per Unit</Label>
                  <Input
                    id="ouncesPerUnit"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={formData.ouncesPerUnit}
                    onChange={(e) => setFormData({ ...formData, ouncesPerUnit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="15.50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="50"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    placeholder="10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    required
                  />
                </div>
              </div>
              {formData.price && formData.ouncesPerUnit && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">Cost per ounce: ${(parseFloat(formData.price) / parseFloat(formData.ouncesPerUnit)).toFixed(2)}</p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Color
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Brand overview view
  // Show all brands, even if no inventory items exist for them
  const brandSummaries = brands.map((brand) => {
    const items = inventory.filter(item => item.brand === brand);
    const totalStock = items.reduce((sum, item) => sum + item.stockQuantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
    const lowStockCount = items.filter(item => item.stockQuantity <= item.lowStockThreshold).length;
    let status: BrandSummary['status'] = 'good';
    const outOfStockCount = items.filter(item => item.stockQuantity === 0).length;
    if (items.length === 0) {
      status = 'good';
    } else if (outOfStockCount > 0) {
      status = 'critical';
    } else if (lowStockCount > 0) {
      status = 'warning';
    }
    return {
      brand,
      totalStock,
      totalValue,
      lowStockCount,
      status,
    };
  });
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
  const lowStockCount = inventory.filter(item => item.stockQuantity <= item.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Overview</h1>
          <p className="text-muted-foreground">Manage your hair color inventory by brand</p>
        </div>
        <Button onClick={() => setShowAddBrandDialog(true)} className="bg-gradient-to-r from-salon-purple to-salon-teal hover:from-salon-purple/90 hover:to-salon-teal/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>
      {/* Add Brand Dialog */}
      <Dialog open={showAddBrandDialog} onOpenChange={setShowAddBrandDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Add a new brand to your inventory. Brand names must be unique.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBrand} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="e.g., Goldwell"
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                required
                autoFocus
                aria-label="Brand Name"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddBrandDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Brand</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-salon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStockValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {inventory.length} different colors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Package className="h-4 w-4 text-salon-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.reduce((sum, item) => sum + item.stockQuantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Units in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Table */}
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>Click on a brand to view detailed inventory</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Brand</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandSummaries.map((brand) => (
                  <TableRow 
                    key={brand.brand} 
                    className="hover:bg-muted/20 cursor-pointer group"
                    onClick={() => setSelectedBrand(brand.brand)}
                  >
                    <TableCell className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{brand.brand}</div>
                        <div className="text-sm text-muted-foreground">
                          {inventory.filter(item => item.brand === brand.brand).length} colors
                        </div>
                      </div>
                     {/* Delete button only if no colors */}
                     {inventory.filter(item => item.brand === brand.brand).length === 0 && (
                       <button
                         type="button"
                         tabIndex={0}
                         aria-label={`Delete brand ${brand.brand}`}
                         className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                         onClick={e => {
                           e.stopPropagation();
                           setBrandToDelete(brand.brand);
                           setShowDeleteBrandDialog(true);
                         }}
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{brand.totalStock}</span>
                      <span className="text-muted-foreground text-sm ml-1">units</span>
                    </TableCell>
                    <TableCell className="font-semibold text-salon-purple">
                      ${brand.totalValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(brand.status)}
                      {brand.lowStockCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {brand.lowStockCount} low stock items
                        </div>
                      )}
                      {inventory.filter(item => item.brand === brand.brand).length === 0 && (
                        <div className="text-xs text-muted-foreground mt-1">No colors yet</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Delete Brand Dialog */}
      <Dialog open={showDeleteBrandDialog} onOpenChange={setShowDeleteBrandDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the brand <span className="font-semibold">{brandToDelete}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteBrandDialog(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteBrand}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}