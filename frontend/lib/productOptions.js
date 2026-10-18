/**
 * Universal Int Studio — Product Options Architecture
 *
 * Provides an easy, maintainable way to define and retrieve variant options
 * (Dimensions, Materials, Finishes) for any furniture piece.
 *
 * Future customizations (colors, fabrics, bespoke scaling) can be added here
 * or loaded dynamically from the product record with zero breaking changes.
 */

export function getProductOptions(product) {
  if (!product) return { dimensions: [], materials: [], finishes: [] };

  const slug = product.slug || '';
  const standardDim = product.dimensions || 'Standard Proportions';
  const standardMat = product.material || 'Solid Timber';
  const standardFinish = product.finish || 'Natural Oiled';

  // Smart options dictionary based on product category & design
  const PRESETS = {
    'arc-dining-chair-set': {
      dimensions: ['Set of 4 (Standard)', 'Set of 6 (+₹38,000)', 'Set of 8 (+₹72,000)'],
      materials: [
        'Saddle Leather + Solid Oak',
        'Cognac Top-Grain Leather + Walnut (+₹12,000)',
        'Natural Bouclé + Oak',
      ],
      finishes: [
        'Tan Leather + Oiled Oak',
        'Black Leather + Smoked Oak',
        'Caramel Leather + Natural Teak',
      ],
    },
    'oslo-sectional-sofa': {
      dimensions: [
        '3-Seater (W 260 × D 160 cm)',
        '4-Seater Standard (W 310 × D 180 cm)',
        'Grand Modular (W 360 × D 220 cm)',
      ],
      materials: [
        'Bouclé Fabric + Solid Oak',
        'Belgian Linen + Solid Walnut (+₹18,000)',
        'Performance Velvet + Oak',
      ],
      finishes: [
        'Dove Grey + Natural Oak',
        'Warm Alabaster + Smoked Oak',
        'Forest Green + Oiled Walnut',
      ],
    },
    'dune-coffee-table': {
      dimensions: [
        'Compact (W 90 × D 50 × H 40 cm)',
        'Standard (W 110 × D 60 × H 40 cm)',
        'Grand (W 130 × D 70 × H 42 cm)',
      ],
      materials: [
        'Travertine + Brushed Steel',
        'Carrara White Marble + Brass (+₹14,000)',
        'Black Marquina Marble + Black Steel',
      ],
      finishes: [
        'Natural Travertine + Silver',
        'Honed Travertine + Antique Brass',
        'Polished Silver + Travertine',
      ],
    },
    'slab-dining-table': {
      dimensions: [
        '6-Seater (W 200 × D 95 cm)',
        '8-Seater (W 240 × D 100 cm)',
        '10-Seater Grand (W 280 × D 105 cm)',
      ],
      materials: [
        'Live Edge Mango Wood + Steel',
        'Solid American Walnut + Steel (+₹35,000)',
        'Reclaimed Teak Slab',
      ],
      finishes: [
        'Natural Edge + Matte Black',
        'Smoked Espresso + Charcoal',
        'Organic Honey + Brushed Brass',
      ],
    },
    'lune-accent-chair': {
      dimensions: ['Standard (W 70 × D 75 × H 80 cm)', 'Wide Lounge (W 78 × D 82 × H 80 cm)'],
      materials: [
        'Full-grain Leather + Solid Walnut',
        'Shearling Bouclé + Solid Oak',
        'Nubuck Suede + Walnut',
      ],
      finishes: [
        'Cognac + Oiled Walnut',
        'Saddle Brown + Smoked Oak',
        'Charcoal Black + Ebonized Walnut',
      ],
    },
    'drift-platform-bed': {
      dimensions: [
        'Queen (W 170 × D 215 × H 110 cm)',
        'King (W 200 × D 215 × H 110 cm) (+₹18,000)',
      ],
      materials: [
        'Solid Walnut + Linen Fabric',
        'Solid Teak + Bouclé Headboard',
        'Solid Oak + Full Leather Headboard',
      ],
      finishes: [
        'Oiled Walnut + Cream Linen',
        'Natural Oak + Warm Taupe',
        'Smoked Walnut + Charcoal Linen',
      ],
    },
    'beam-standing-desk': {
      dimensions: [
        'Compact (W 140 × D 70 cm)',
        'Standard (W 160 × D 80 cm)',
        'Executive (W 180 × D 85 cm)',
      ],
      materials: [
        'Solid Bamboo + Steel',
        'Solid Walnut + Dual Motor Steel (+₹22,000)',
        'Solid Oak + Matte Black',
      ],
      finishes: [
        'Natural Bamboo + Matte Black',
        'Smoked Walnut + Black Base',
        'Natural Oak + White Powdercoat',
      ],
    },
    'grid-shelving-system': {
      dimensions: [
        '3-Bay Standard (W 120 × D 30 × H 200 cm)',
        '5-Bay Grand (W 200 × D 30 × H 200 cm) (+₹24,000)',
      ],
      materials: [
        'Powder-coated Steel + Solid Oak',
        'Powder-coated Steel + American Walnut (+₹16,000)',
      ],
      finishes: [
        'Matte Black + Natural Oak',
        'Architectural Charcoal + Smoked Oak',
        'Champagne Brass + Walnut',
      ],
    },
  };

  // 1. Database-driven dimensions from product_dimensions table:
  let dimensionsList = [];
  if (Array.isArray(product.dimension_options) && product.dimension_options.length > 0) {
    dimensionsList = product.dimension_options.map((d) => {
      if (d.price_delta && d.price_delta > 0) {
        return `${d.label} (+₹${Number(d.price_delta).toLocaleString('en-IN')})`;
      } else if (d.price_delta && d.price_delta < 0) {
        return `${d.label} (-₹${Math.abs(Number(d.price_delta)).toLocaleString('en-IN')})`;
      }
      return d.label;
    });
  } else if (product.options && typeof product.options === 'object' && product.options.dimensions) {
    dimensionsList = product.options.dimensions;
  } else if (PRESETS[slug]?.dimensions) {
    dimensionsList = PRESETS[slug].dimensions;
  } else if (product.dimensions) {
    dimensionsList = [product.dimensions];
  } else {
    dimensionsList = [standardDim];
  }

  // 2. Materials & Finishes (presets or product standard fields)
  const preset = PRESETS[slug] || {};
  let materialsList = preset.materials || (product.material ? [product.material] : [standardMat]);
  let finishesList = preset.finishes || (product.finish ? [product.finish] : [standardFinish]);

  if (product.options && typeof product.options === 'object') {
    if (product.options.materials) materialsList = product.options.materials;
    if (product.options.finishes) finishesList = product.options.finishes;
  }

  return {
    dimensions: dimensionsList,
    materials: materialsList,
    finishes: finishesList,
  };
}
