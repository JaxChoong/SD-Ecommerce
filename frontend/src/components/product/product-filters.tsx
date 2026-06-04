import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

interface ProductFiltersProps {
  minPrice: number | undefined
  onMinPriceChange: (price: number | undefined) => void
  maxPrice: number | undefined
  onMaxPriceChange: (price: number | undefined) => void
  inStock: boolean
  onInStockChange: (checked: boolean) => void
  onSale: boolean
  onOnSaleChange: (checked: boolean) => void
}

const priceRanges = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under RM50', min: undefined, max: 50 },
  { label: 'RM50 - RM100', min: 50, max: 100 },
  { label: 'RM100 - RM200', min: 100, max: 200 },
  { label: 'Over RM200', min: 200, max: undefined },
]

export function ProductFilters({
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  inStock,
  onInStockChange,
  onSale,
  onOnSaleChange,
}: ProductFiltersProps) {
  const priceKey = priceRanges.findIndex(
    (r) => r.min === minPrice && r.max === maxPrice,
  )

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3 leading-relaxed">Price Range</h4>
        <RadioGroup
          value={String(priceKey >= 0 ? priceKey : 0)}
          onValueChange={(v) => {
            const idx = Number(v)
            onMinPriceChange(priceRanges[idx].min)
            onMaxPriceChange(priceRanges[idx].max)
          }}
        >
          {priceRanges.map((range, i) => (
            <div key={i} className="flex items-center gap-2">
              <RadioGroupItem value={String(i)} id={`price-${i}`} />
              <Label htmlFor={`price-${i}`} className="text-sm font-normal leading-relaxed">{range.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStock}
            onCheckedChange={(c) => onInStockChange(c === true)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal leading-relaxed">In Stock Only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="on-sale"
            checked={onSale}
            onCheckedChange={(c) => onOnSaleChange(c === true)}
          />
          <Label htmlFor="on-sale" className="text-sm font-normal leading-relaxed">On Sale</Label>
        </div>
      </div>
    </div>
  )
}
