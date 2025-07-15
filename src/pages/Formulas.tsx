import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Calendar, DollarSign, Palette, Search, Image as ImageIcon, ArrowLeft, Grid, List, Clock } from "lucide-react";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface ColorUsage {
  colorId: string;
  shade: string;
  brand: string;
  amountUsed: number; // in ounces
  costPerOunce: number;
}

interface Formula {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  notes: string;
  beforeImage?: string;
  afterImage?: string;
  colorsUsed: ColorUsage[];
  totalCost: number;
}

interface Client {
  id: string;
  name: string;
  formulas: Formula[];
  lastVisit: string;
  totalSpent: number;
}

// Mock inventory data
const mockInventory = [
  { id: "1", shade: "Platinum Blonde 10A", brand: "L'Oréal", costPerOunce: 7.75, stockQuantity: 45 },
  { id: "2", shade: "Copper Red 6R", brand: "Wella", costPerOunce: 8.69, stockQuantity: 8 },
  { id: "3", shade: "Ash Brown 4A", brand: "Redken", costPerOunce: 8.38, stockQuantity: 32 },
];

// Mock initial formulas grouped by client
const initialFormulas: Formula[] = [
  {
    id: "1",
    clientId: "client1",
    clientName: "Sarah Johnson",
    date: "2024-01-15",
    notes: "Full head highlights with toner. Client wanted platinum blonde look.",
    colorsUsed: [
      { colorId: "1", shade: "Platinum Blonde 10A", brand: "L'Oréal", amountUsed: 3.5, costPerOunce: 7.75 },
      { colorId: "2", shade: "Toner T18", brand: "Wella", amountUsed: 1.0, costPerOunce: 6.50 },
    ],
    totalCost: 33.63,
  },
  {
    id: "2",
    clientId: "client2",
    clientName: "Emily Davis",
    date: "2024-01-14",
    notes: "Root touch-up and color refresh. Added copper tones.",
    colorsUsed: [
      { colorId: "2", shade: "Copper Red 6R", brand: "Wella", amountUsed: 2.0, costPerOunce: 8.69 },
      { colorId: "3", shade: "Developer 30", brand: "Generic", amountUsed: 2.0, costPerOunce: 3.25 },
    ],
    totalCost: 23.88,
  },
  {
    id: "3",
    clientId: "client1",
    clientName: "Sarah Johnson",
    date: "2024-01-10",
    notes: "Initial consultation and color test. Preparing for full highlights.",
    colorsUsed: [
      { colorId: "1", shade: "Platinum Blonde 10A", brand: "L'Oréal", amountUsed: 0.5, costPerOunce: 7.75 },
    ],
    totalCost: 3.88,
  },
];

export default function Formulas() {
  const [formulas, setFormulas] = useState<Formula[]>(initialFormulas);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorUsage[]>([]);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [colorSearch, setColorSearch] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    isNewClient: true,
    date: new Date().toISOString().slice(0, 16), // default to now, formatted for datetime-local
    notes: "",
    beforeImage: undefined as string | undefined,
    afterImage: undefined as string | undefined,
  });

  // Group formulas by client
  const getClients = (): Client[] => {
    const clientMap = new Map<string, Client>();

    formulas.forEach(formula => {
      if (!clientMap.has(formula.clientId)) {
        clientMap.set(formula.clientId, {
          id: formula.clientId,
          name: formula.clientName,
          formulas: [],
          lastVisit: formula.date,
          totalSpent: 0,
        });
      }

      const client = clientMap.get(formula.clientId)!;
      client.formulas.push(formula);
      client.totalSpent += formula.totalCost;
      
      // Update last visit if this formula is more recent
      if (formula.date > client.lastVisit) {
        client.lastVisit = formula.date;
      }
    });

    // Sort formulas by date (most recent first) for each client
    clientMap.forEach(client => {
      client.formulas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return Array.from(clientMap.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  };

  const filteredClients = getClients().filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.formulas.some(formula => formula.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const existingClients = getClients().map(client => client.name);

  const handleAddColor = (colorId: string) => {
    const color = mockInventory.find(c => c.id === colorId);
    if (!color) return;

    const existingColor = selectedColors.find(c => c.colorId === colorId);
    if (existingColor) {
      toast({ title: "Color already added", variant: "destructive" });
      return;
    }

    setSelectedColors([...selectedColors, {
      colorId: color.id,
      shade: color.shade,
      brand: color.brand,
      amountUsed: 0,
      costPerOunce: color.costPerOunce,
    }]);
  };

  // Remove handleAddPendingColors, not needed for single-select

  const handleColorAmountChange = (colorId: string, amount: number) => {
    setSelectedColors(selectedColors.map(color =>
      color.colorId === colorId ? { ...color, amountUsed: amount } : color
    ));
  };

  const handleRemoveColor = (colorId: string) => {
    setSelectedColors(selectedColors.filter(color => color.colorId !== colorId));
  };

  const calculateTotalCost = () => {
    return selectedColors.reduce((total, color) => {
      return total + (color.amountUsed * color.costPerOunce);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedColors.length === 0) {
      toast({ title: "Please add at least one color", variant: "destructive" });
      return;
    }

    if (selectedColors.some(color => color.amountUsed <= 0)) {
      toast({ title: "Please enter amounts for all colors", variant: "destructive" });
      return;
    }

    // Determine clientId - either existing or new
    let clientId: string;
    if (formData.isNewClient) {
      clientId = `client_${Date.now()}`;
    } else {
      const existingClient = getClients().find(client => client.name === formData.clientName);
      clientId = existingClient?.id || `client_${Date.now()}`;
    }

    const newFormula: Formula = {
      id: Date.now().toString(),
      clientId,
      clientName: formData.clientName,
      date: formData.date,
      notes: formData.notes,
      beforeImage: formData.beforeImage,
      afterImage: formData.afterImage,
      colorsUsed: selectedColors,
      totalCost: calculateTotalCost(),
    };

    setFormulas([newFormula, ...formulas]);
    toast({ title: "Formula saved successfully!" });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      isNewClient: true,
      date: new Date().toISOString().slice(0, 16), // default to now, formatted for datetime-local
      notes: "",
      beforeImage: undefined,
      afterImage: undefined,
    });
    setSelectedColors([]);
    setShowAddDialog(false);
  };

  const totalFormulas = formulas.length;
  const uniqueClients = getClients().length;
  const avgCost = formulas.reduce((sum, f) => sum + f.totalCost, 0) / formulas.length;

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'beforeImage' | 'afterImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, [type]: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (type: 'beforeImage' | 'afterImage') => {
    setFormData((prev) => ({ ...prev, [type]: undefined }));
  };

  // Client detail view
  if (selectedClient) {
    const client = getClients().find(c => c.id === selectedClient);
    if (!client) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedClient(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-muted-foreground">
                {client.formulas.length} formulas • Last visit: {client.lastVisit} • Total spent: ${client.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
          <Button onClick={() => {
            setFormData({ ...formData, clientName: client.name, isNewClient: false });
            setShowAddDialog(true);
          }} className="bg-gradient-to-r from-salon-purple to-salon-teal hover:from-salon-purple/90 hover:to-salon-teal/90">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Formula History */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Formula History</h2>
          {client.formulas.map((formula) => (
            <Card key={formula.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formula.date}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4" />
                      ${formula.totalCost.toFixed(2)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formula.notes && (
                  <p className="text-sm text-muted-foreground">{formula.notes}</p>
                )}
                {/* Before/After Images */}
                {(formula.beforeImage || formula.afterImage) && (
                  <div className="flex gap-4 mt-2">
                    {formula.beforeImage && (
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Before</p>
                        <img src={formula.beforeImage} alt="Before" className="w-full h-32 object-cover rounded-md border" />
                      </div>
                    )}
                    {formula.afterImage && (
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">After</p>
                        <img src={formula.afterImage} alt="After" className="w-full h-32 object-cover rounded-md border" />
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Colors Used
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {formula.colorsUsed.map((color, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                        <div>
                          <p className="font-medium text-sm">{color.shade}</p>
                          <p className="text-xs text-muted-foreground">{color.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{color.amountUsed} oz</p>
                          <p className="text-xs text-muted-foreground">
                            ${(color.amountUsed * color.costPerOunce).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Formulas</h1>
          <p className="text-muted-foreground">Manage client color formulas and appointment history</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-salon-purple to-salon-teal hover:from-salon-purple/90 hover:to-salon-teal/90">
                <Plus className="h-4 w-4 mr-2" />
                New Formula
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Formula</DialogTitle>
                <DialogDescription>
                  Record a new color formula for a client appointment
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.isNewClient ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isNewClient: true, clientName: "" })}
                    >
                      New Client
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isNewClient ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isNewClient: false })}
                    >
                      Existing Client
                    </Button>
                  </div>
                  {formData.isNewClient ? (
                    <Input
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  ) : (
                    <select
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select existing client</option>
                      {existingClients.map((clientName) => (
                        <option key={clientName} value={clientName}>{clientName}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe the color process, client preferences, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                {/* Before/After Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Before Picture</Label>
                    {formData.beforeImage ? (
                      <div className="relative group">
                        <img src={formData.beforeImage} alt="Before" className="w-full h-40 object-cover rounded-md border" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-80 group-hover:opacity-100"
                          onClick={() => handleRemoveImage('beforeImage')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'beforeImage')}
                        aria-label="Upload before picture"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>After Picture</Label>
                    {formData.afterImage ? (
                      <div className="relative group">
                        <img src={formData.afterImage} alt="After" className="w-full h-40 object-cover rounded-md border" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-80 group-hover:opacity-100"
                          onClick={() => handleRemoveImage('afterImage')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'afterImage')}
                        aria-label="Upload after picture"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Colors Used</Label>
                    <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Add colors"
                          className="ml-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search colors..."
                            value={colorSearch}
                            onValueChange={setColorSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No colors found.</CommandEmpty>
                            {mockInventory
                              .filter(color =>
                                color.shade.toLowerCase().includes(colorSearch.toLowerCase()) ||
                                color.brand.toLowerCase().includes(colorSearch.toLowerCase())
                              )
                              .map(color => (
                                <CommandItem
                                  key={color.id}
                                  onSelect={() => {
                                    if (selectedColors.find(c => c.colorId === color.id)) {
                                      toast({ title: "Color already added", variant: "destructive" });
                                    } else {
                                      handleAddColor(color.id);
                                    }
                                    setColorPopoverOpen(false);
                                    setColorSearch("");
                                  }}
                                  role="option"
                                  tabIndex={0}
                                >
                                  <span className="flex-1">{color.shade} - {color.brand}</span>
                                </CommandItem>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedColors.length > 0 && (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {selectedColors.map((color) => (
                        <div key={color.colorId} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{color.shade}</p>
                            <p className="text-xs text-muted-foreground">{color.brand} • ${color.costPerOunce.toFixed(2)}/oz</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              className="w-20"
                              value={color.amountUsed || ""}
                              onChange={(e) => handleColorAmountChange(color.colorId, parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-sm text-muted-foreground">oz</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveColor(color.colorId)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedColors.length > 0 && (
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium">Total Cost: ${calculateTotalCost().toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Formula
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-salon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formulas</CardTitle>
            <Calendar className="h-4 w-4 text-salon-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFormulas}</div>
            <p className="text-xs text-muted-foreground">All appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-salon-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per formula</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Clients List */}
      <div className={viewMode === 'compact' ? 'space-y-2' : 'space-y-4'}>
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedClient(client.id)}
          >
            {viewMode === 'compact' ? (
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {client.formulas.length} appointments • Last: {client.lastVisit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${client.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">total spent</p>
                  </div>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last visit: {client.lastVisit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {client.formulas.length} appointments
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${client.totalSpent.toFixed(2)} total
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium mb-2">Recent Formula</h4>
                    {client.formulas[0] && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm font-medium">{client.formulas[0].date}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {client.formulas[0].notes || "No notes"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {client.formulas[0].colorsUsed.slice(0, 2).map((color, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {color.shade}
                            </Badge>
                          ))}
                          {client.formulas[0].colorsUsed.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{client.formulas[0].colorsUsed.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? "Try adjusting your search term" 
                : "Create your first client formula to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}