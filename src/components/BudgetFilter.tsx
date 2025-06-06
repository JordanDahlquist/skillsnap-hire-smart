
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface BudgetFilterProps {
  employmentType: string;
  budgetRange: number[];
  onBudgetChange: (range: number[]) => void;
}

const BUDGET_PRESETS = {
  "full-time": [
    { label: "Entry Level", range: [30000, 60000] },
    { label: "Mid Level", range: [60000, 100000] },
    { label: "Senior Level", range: [100000, 150000] },
    { label: "Executive", range: [150000, 250000] }
  ],
  "part-time": [
    { label: "Entry Level", range: [15000, 30000] },
    { label: "Mid Level", range: [30000, 50000] },
    { label: "Senior Level", range: [50000, 80000] }
  ],
  "contract": [
    { label: "Small Project", range: [1000, 5000] },
    { label: "Medium Project", range: [5000, 25000] },
    { label: "Large Project", range: [25000, 100000] },
    { label: "Enterprise", range: [100000, 500000] }
  ],
  "project": [
    { label: "Small Project", range: [500, 5000] },
    { label: "Medium Project", range: [5000, 25000] },
    { label: "Large Project", range: [25000, 100000] },
    { label: "Enterprise", range: [100000, 500000] }
  ]
};

export const BudgetFilter = ({ employmentType, budgetRange, onBudgetChange }: BudgetFilterProps) => {
  const [minValue, setMinValue] = useState(budgetRange[0].toString());
  const [maxValue, setMaxValue] = useState(budgetRange[1].toString());
  const [isCustom, setIsCustom] = useState(false);

  const presets = BUDGET_PRESETS[employmentType as keyof typeof BUDGET_PRESETS] || BUDGET_PRESETS.project;
  
  const getBudgetLabel = () => {
    switch (employmentType) {
      case "full-time":
      case "part-time":
        return "Annual Salary Range";
      case "contract":
      case "project":
        return "Project Budget Range";
      default:
        return "Budget Range";
    }
  };

  const getCurrencyHint = () => {
    switch (employmentType) {
      case "full-time":
      case "part-time":
        return "per year";
      case "contract":
      case "project":
        return "total project value";
      default:
        return "";
    }
  };

  useEffect(() => {
    setMinValue(budgetRange[0].toString());
    setMaxValue(budgetRange[1].toString());
  }, [budgetRange]);

  const handlePresetClick = (range: number[]) => {
    setIsCustom(false);
    onBudgetChange(range);
  };

  const handleCustomChange = () => {
    const min = parseInt(minValue) || 0;
    const max = parseInt(maxValue) || 200000;
    onBudgetChange([Math.min(min, max), Math.max(min, max)]);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  const isDefaultRange = budgetRange[0] === 0 && budgetRange[1] === 200000;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          {getBudgetLabel()}
          {getCurrencyHint() && (
            <span className="text-xs text-muted-foreground">({getCurrencyHint()})</span>
          )}
        </Label>
        
        {!isDefaultRange && (
          <div className="text-sm text-gray-600">
            Current: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
          </div>
        )}
      </div>

      {!isCustom && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.range)}
                className="text-xs"
              >
                {preset.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {formatCurrency(preset.range[0])} - {formatCurrency(preset.range[1])}
                </Badge>
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCustom(true)}
            className="text-sm"
          >
            Set custom range
          </Button>
        </div>
      )}

      {isCustom && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Minimum</Label>
              <Input
                type="number"
                placeholder="0"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                onBlur={handleCustomChange}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Maximum</Label>
              <Input
                type="number"
                placeholder="200000"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                onBlur={handleCustomChange}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustom(false)}
              className="text-sm"
            >
              Back to presets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBudgetChange([0, 200000])}
              className="text-sm"
            >
              Any budget
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
