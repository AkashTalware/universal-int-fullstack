'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import { api, formatPrice } from '@/lib/api';
import { getProductOptions } from '@/lib/productOptions';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('dimensions');
  const [customQuoteOpen, setCustomQuoteOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Variant Options Provision
  const options = product
    ? getProductOptions(product)
    : { dimensions: [], materials: [], finishes: [] };
  const [selectedDim, setSelectedDim] = useState('');
  const [selectedMat, setSelectedMat] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');

  // Custom Quote Modal State
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    customDims: '',
    notes: '',
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await api.getProduct(slug);
        setProduct(p);
        setActiveImg(0);
        const opts = getProductOptions(p);
        setSelectedDim(opts.dimensions[0] || p.dimensions || '');
        setSelectedMat(opts.materials[0] || p.material || '');
        setSelectedFinish(opts.finishes[0] || p.finish || '');
        if (p.category_slug) {
          const rel = await api.getProducts({ category: p.category_slug });
          setRelated(rel.filter((r) => r.id !== p.id).slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, qty, {
      dimensions: selectedDim,
      material: selectedMat,
      finish: selectedFinish,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handlePrevImg(e) {
    e?.stopPropagation?.();
    const len = product?.images?.length || 1;
    setActiveImg((prev) => (prev === 0 ? len - 1 : prev - 1));
  }

  function handleNextImg(e) {
    e?.stopPropagation?.();
    const len = product?.images?.length || 1;
    setActiveImg((prev) => (prev === len - 1 ? 0 : prev + 1));
  }

  async function handleQuoteSubmit(e) {
    e.preventDefault();
    setQuoteSubmitting(true);
    try {
      await api.createInquiry({
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        message: `Bespoke Quote for ${product?.name} (Slug: ${product?.slug}): Custom Dims: "${quoteForm.customDims || 'Standard'}" | Notes: ${quoteForm.notes || 'None'}`,
        cart_items: [
          { id: product?.id, name: product?.name, price: product?.price, quantity: qty },
        ],
      });
      setQuoteSubmitted(true);
    } catch (err) {
      console.error('Quote error:', err);
    } finally {
      setQuoteSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="product-detail-grid">
          <div>
            <div
              className="skeleton"
              style={{ aspectRatio: '4/3', borderRadius: 'var(--radius-lg)' }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <div
                className="skeleton"
                style={{ width: '80px', height: '60px', borderRadius: 'var(--radius)' }}
              />
              <div
                className="skeleton"
                style={{ width: '80px', height: '60px', borderRadius: 'var(--radius)' }}
              />
              <div
                className="skeleton"
                style={{ width: '80px', height: '60px', borderRadius: 'var(--radius)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ height: '14px', width: '30%' }} />
            <div className="skeleton" style={{ height: '40px', width: '80%' }} />
            <div className="skeleton" style={{ height: '32px', width: '40%' }} />
            <div className="skeleton" style={{ height: '90px', width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container"
        style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center' }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '16px' }}>
          Product not found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          The furniture piece you are looking for may have been archived or moved.
        </p>
        <Link href="/shop" className="btn btn-outline">
          Explore All Collections
        </Link>
      </div>
    );
  }

  const {
    id,
    name,
    price,
    sale_price,
    images = [],
    category_name,
    category_slug,
    description,
    dimensions,
    material,
    finish,
    in_stock,
  } = product;

  const hasSale = sale_price && sale_price < price;
  const currentPrice = hasSale ? sale_price : price;
  const discount = hasSale ? Math.round((1 - sale_price / price) * 100) : 0;
  const emiPerMonth = Math.round(currentPrice / 12);
  const totalPhotos = images.length || 1;

  // IKEA-style derived specifications
  const estWeight = Math.round(Math.min(120, Math.max(14, price / 2500 + 12)));
  const boxCount = price > 80000 ? 2 : 1;
  const warrantyYears = 10;

  return (
    <div className="page-enter">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div
          className="breadcrumb"
          style={{ paddingTop: 'calc(var(--header-h) + 24px)', marginBottom: '28px' }}
        >
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          {category_name && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${category_slug}`}>{category_name}</Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>{name}</span>
        </div>

        {/* ── Main Detail Grid ── */}
        <div className="product-detail-grid">
          {/* Left Column: Interactive Multi-Photo Gallery */}
          <div className="product-gallery-col">
            <div
              className="gallery-main"
              onClick={() => setLightboxOpen(true)}
              style={{ cursor: 'zoom-in', position: 'relative' }}
              title="Click to view full-resolution"
            >
              {images?.[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={`${name} — view ${activeImg + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-faint)' }}>No image available</span>
                </div>
              )}

              {/* Obsidian Category Tag */}
              {category_name && (
                <span
                  className={`product-badge tag-glass tag-${category_slug || 'default'}`}
                  style={{ top: '16px', left: '16px' }}
                >
                  <span className="tag-gem" />
                  <span className="tag-label">{category_name}</span>
                </span>
              )}

              {/* Obsidian Sale Tag */}
              {hasSale && (
                <span
                  className="product-sale-badge tag-glass tag-sale"
                  style={{ top: '16px', right: '16px' }}
                >
                  <span className="tag-gem tag-gem-emerald" />
                  <span className="tag-label">–{discount}%</span>
                </span>
              )}

              {/* Photo Counter Pill */}
              {totalPhotos > 1 && (
                <div className="gallery-counter-pill">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>
                    {activeImg + 1} / {totalPhotos}
                  </span>
                </div>
              )}

              {/* In-Image Left/Right Chevrons */}
              {totalPhotos > 1 && (
                <>
                  <button
                    className="gallery-nav-arrow gallery-nav-left"
                    onClick={handlePrevImg}
                    aria-label="Previous image"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="gallery-nav-arrow gallery-nav-right"
                    onClick={handleNextImg}
                    aria-label="Next image"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images?.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`gallery-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={img} alt={`${name} thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Gallery Hint */}
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-faint)',
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              🔍 Click on photo to view high-resolution details • Use arrow keys to navigate
            </p>
          </div>

          {/* Right Column: In-Depth Purchasing Suite */}
          <div className="product-detail-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="product-detail-cat">{category_name} Collection</p>
              <span
                style={{
                  fontSize: '12px',
                  color: in_stock ? '#4ade80' : 'var(--danger)',
                  fontWeight: 600,
                }}
              >
                {in_stock ? '● In Stock & Ready to Ship' : '○ Made to Order (3–4 weeks)'}
              </span>
            </div>

            <h1 className="product-detail-name">{name}</h1>

            {/* Price Row */}
            <div className="product-detail-price">
              <span className="price-main">{formatPrice(currentPrice)}</span>
              {hasSale && (
                <>
                  <span className="price-orig">{formatPrice(price)}</span>
                  <span className="price-save">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Financing / EMI Callout */}
            <div className="product-emi-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>💳</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    No-Cost EMI from ₹{emiPerMonth.toLocaleString('en-IN')}/month
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Available on major credit cards • 3, 6, 9 & 12 months tenure options
                  </p>
                </div>
              </div>
            </div>

            {description && <p className="product-detail-desc">{description}</p>}

            {/* Key Quick Specs Matrix */}
            <div className="product-specs">
              {dimensions && (
                <div className="spec-item">
                  <label>📐 Dimensions</label>
                  <span>{selectedDim || dimensions}</span>
                </div>
              )}
              {material && (
                <div className="spec-item">
                  <label>🪵 Material</label>
                  <span>{selectedMat || material}</span>
                </div>
              )}
              {finish && (
                <div className="spec-item">
                  <label>🎨 Finish</label>
                  <span>{selectedFinish || finish}</span>
                </div>
              )}
              <div className="spec-item">
                <label>⚖️ Approx. Weight</label>
                <span>~{estWeight} kg net</span>
              </div>
            </div>

            {/* ── Configurable Variant Options ── */}
            {options.dimensions.length > 1 && (
              <div className="quickview-option-group" style={{ marginTop: '16px' }}>
                <div className="quickview-option-header">
                  <span className="quickview-option-label">📐 Dimensions / Sizing</span>
                  <span className="quickview-option-selected">{selectedDim}</span>
                </div>
                <div className="quickview-chip-row">
                  {options.dimensions.map((dim) => (
                    <button
                      key={dim}
                      type="button"
                      className={`quickview-option-chip ${selectedDim === dim ? 'active' : ''}`}
                      onClick={() => setSelectedDim(dim)}
                    >
                      {dim}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {options.materials.length > 1 && (
              <div className="quickview-option-group" style={{ marginTop: '12px' }}>
                <div className="quickview-option-header">
                  <span className="quickview-option-label">🪵 Material Specification</span>
                  <span className="quickview-option-selected">{selectedMat}</span>
                </div>
                <div className="quickview-chip-row">
                  {options.materials.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      className={`quickview-option-chip ${selectedMat === mat ? 'active' : ''}`}
                      onClick={() => setSelectedMat(mat)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {options.finishes.length > 1 && (
              <div className="quickview-option-group" style={{ marginTop: '12px' }}>
                <div className="quickview-option-header">
                  <span className="quickview-option-label">🎨 Surface Finish</span>
                  <span className="quickview-option-selected">{selectedFinish}</span>
                </div>
                <div className="quickview-chip-row">
                  {options.finishes.map((fsh) => (
                    <button
                      key={fsh}
                      type="button"
                      className={`quickview-option-chip ${selectedFinish === fsh ? 'active' : ''}`}
                      onClick={() => setSelectedFinish(fsh)}
                    >
                      {fsh}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart (Flush 48px Aligned) */}
            <div className="product-detail-qty-row">
              <div className="qty-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-val">{qty}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`btn ${added ? 'btn-added' : 'btn-primary'} product-detail-add-cart-btn`}
                onClick={handleAddToCart}
                disabled={!in_stock}
                id="product-add-to-cart"
              >
                {added ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Added to Your Cart!</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Bespoke Dimension / Consultation Option */}
            <button
              onClick={() => setCustomQuoteOpen(true)}
              className="btn btn-outline w-full"
              style={{ justifyContent: 'center', marginTop: '10px', height: '44px' }}
            >
              <span>Need Custom Dimensions or Wood Finish? Request Quote →</span>
            </button>

            {/* Four Luxury Standards Badges */}
            <div className="product-highlights-grid">
              <div className="highlight-pill">
                <span className="highlight-icon">🚚</span>
                <div>
                  <strong>White-Glove Delivery</strong>
                  <span>Complimentary Pan-India transit</span>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon">🪵</span>
                <div>
                  <strong>FSC-Certified Timber</strong>
                  <span>Kiln-dried hardwood, zero warping</span>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon">🛠️</span>
                <div>
                  <strong>In-Room Assembly</strong>
                  <span>Unboxed and placed by specialists</span>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon">🛡️</span>
                <div>
                  <strong>10-Year Warranty</strong>
                  <span>Full coverage on structural frame</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            IKEA-STYLE TECHNICAL SPECIFICATIONS & BLUEPRINT
        ══════════════════════════════════════════════════════ */}
        <section className="product-deep-specs-section">
          <div className="specs-section-header">
            <span className="section-eyebrow">Technical Dossier</span>
            <h2 className="specs-section-title">Product Details, Dimensions & Care</h2>
            <p className="specs-section-subtitle">
              Comprehensive specifications, joinery blueprints, and preservation guidelines crafted
              to international standards.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="ikea-tabs-nav" role="tablist">
            <button
              className={`ikea-tab-btn ${activeTab === 'dimensions' ? 'active' : ''}`}
              onClick={() => setActiveTab('dimensions')}
              role="tab"
              aria-selected={activeTab === 'dimensions'}
            >
              <span>📐</span> Dimensions & Blueprint
            </button>
            <button
              className={`ikea-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
              role="tab"
              aria-selected={activeTab === 'materials'}
            >
              <span>🪵</span> Materials & Craftsmanship
            </button>
            <button
              className={`ikea-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
              role="tab"
              aria-selected={activeTab === 'care'}
            >
              <span>🧹</span> Care & Maintenance
            </button>
            <button
              className={`ikea-tab-btn ${activeTab === 'packaging' ? 'active' : ''}`}
              onClick={() => setActiveTab('packaging')}
              role="tab"
              aria-selected={activeTab === 'packaging'}
            >
              <span>📦</span> Packaging & Assembly
            </button>
            <button
              className={`ikea-tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
              onClick={() => setActiveTab('warranty')}
              role="tab"
              aria-selected={activeTab === 'warranty'}
            >
              <span>🛡️</span> 10-Yr Warranty & Trial
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="ikea-tab-panel">
            {activeTab === 'dimensions' && (
              <div className="tab-pane-content">
                <div className="blueprint-grid">
                  <div className="blueprint-data-card">
                    <h3 className="blueprint-heading">Measurements Breakdown</h3>
                    <table className="ikea-spec-table">
                      <tbody>
                        <tr>
                          <th>Overall Product Dimensions</th>
                          <td>
                            <strong>{dimensions || 'Standard architectural proportions'}</strong>
                          </td>
                        </tr>
                        <tr>
                          <th>Clearance Under Furniture</th>
                          <td>14 – 18 cm (Accommodates standard robot vacuum cleaners)</td>
                        </tr>
                        <tr>
                          <th>Net Product Weight</th>
                          <td>Approximately {estWeight} kg</td>
                        </tr>
                        <tr>
                          <th>Maximum Recommended Load</th>
                          <td>
                            {price > 100000
                              ? 'Up to 350 kg evenly distributed'
                              : 'Up to 150 kg static load'}
                          </td>
                        </tr>
                        <tr>
                          <th>Room Footprint Required</th>
                          <td>Allow minimum 45 cm perimeter walkway for optimal aesthetic flow</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="blueprint-visual-card">
                    <div className="blueprint-schematic">
                      <span className="blueprint-badge">Universal CAD Studio</span>
                      <div className="schematic-box">
                        <div className="schematic-dim-h">Height (H)</div>
                        <div className="schematic-dim-w">Width (W)</div>
                        <div className="schematic-dim-d">Depth (D)</div>
                        <p className="schematic-label">{name}</p>
                        <p className="schematic-metric">{dimensions}</p>
                      </div>
                      <p className="schematic-note">
                        * All items are precision hand-built; allow ±0.5 cm natural wood tolerance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="tab-pane-content">
                <div className="materials-breakdown-grid">
                  <div className="mat-card">
                    <span className="mat-icon">🪵</span>
                    <h4>Primary Structure & Timber</h4>
                    <p>
                      Crafted from sustainably harvested, kiln-dried {material || 'hardwood'}.
                      Moisture content is rigorously controlled between 8% and 11% to eliminate
                      seasonal warping, cracking, or bowing.
                    </p>
                  </div>
                  <div className="mat-card">
                    <span className="mat-icon">🎨</span>
                    <h4>Surface Finish & Chemistry</h4>
                    <p>
                      Treated with {finish || 'natural hand-buffed protective oil'}. Zero-VOC,
                      certified food-safe and hypoallergenic. Allows the natural grain to breathe
                      while repelling accidental coffee and wine splashes.
                    </p>
                  </div>
                  <div className="mat-card">
                    <span className="mat-icon">🔩</span>
                    <h4>Structural Joinery & Hardware</h4>
                    <p>
                      Engineered with reinforced traditional mortise & tenon joinery, internal
                      corner bracing blocks, and heavy-duty brushed architectural hardware.
                    </p>
                  </div>
                  <div className="mat-card">
                    <span className="mat-icon">🌿</span>
                    <h4>Eco & Indoor Air Quality</h4>
                    <p>
                      100% free of formaldehyde, halogenated flame retardants, and harsh solvent
                      vapors. Meets CARB Phase 2 and TSCA Title VI clean air mandates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="tab-pane-content">
                <div className="care-guide-container">
                  <div className="care-step">
                    <div className="care-step-num">01</div>
                    <div>
                      <h4>Routine Daily Cleaning</h4>
                      <p>
                        Dust weekly using a soft, dry microfibre cloth in the direction of the wood
                        grain. Avoid generic silicone-based aerosol polishes which build up an oily
                        haze over time.
                      </p>
                    </div>
                  </div>

                  <div className="care-step">
                    <div className="care-step-num">02</div>
                    <div>
                      <h4>Accidental Spills & Liquid Contact</h4>
                      <p>
                        Blot liquids immediately with a dry cloth or paper towel; never rub or wipe
                        forcefully. For stubborn water rings, use a cloth lightly dampened with
                        lukewarm water and mild organic soap, then dry immediately.
                      </p>
                    </div>
                  </div>

                  <div className="care-step">
                    <div className="care-step-num">03</div>
                    <div>
                      <h4>Environmental & Sunlight Protection</h4>
                      <p>
                        Position furniture at least 30 cm away from direct heating vents, radiators,
                        and fireplaces. Prolonged exposure to intense direct afternoon UV rays may
                        naturally warm the timber patina over time.
                      </p>
                    </div>
                  </div>

                  <div className="care-step">
                    <div className="care-step-num">04</div>
                    <div>
                      <h4>Biannual Rejuvenation (Every 6 Months)</h4>
                      <p>
                        Apply a thin coat of natural beeswax balm or mineral wood oil every 6 months
                        to replenish deep wood oils and preserve moisture resistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'packaging' && (
              <div className="tab-pane-content">
                <div className="packaging-grid">
                  <div className="pkg-info-box">
                    <h4>Flat-Pack & Delivery Specifications</h4>
                    <p
                      style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}
                    >
                      Thoughtfully packaged to navigate standard residential doorways, elevators,
                      and stairwells with zero friction.
                    </p>
                    <table className="ikea-spec-table">
                      <tbody>
                        <tr>
                          <th>Number of Shipping Packages</th>
                          <td>
                            <strong>
                              {boxCount} Box{boxCount > 1 ? 'es' : ''}
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <th>Estimated Package Weight</th>
                          <td>
                            ~{estWeight + 6} kg (Gross shipping weight with protective honeycomb
                            foam)
                          </td>
                        </tr>
                        <tr>
                          <th>Protective Packaging Material</th>
                          <td>
                            100% Recyclable high-density honeycomb paperboard, zero shredded
                            polystyrene
                          </td>
                        </tr>
                        <tr>
                          <th>Assembly Required?</th>
                          <td>
                            <strong>Minimal (Approx. 10–15 mins)</strong>. Legs and hardware simply
                            bolt into pre-threaded steel receiver bushings.
                          </td>
                        </tr>
                        <tr>
                          <th>Tools & Hardware Included</th>
                          <td>
                            All precision hex bolts, ergonomic allen key, and heavy-duty felt floor
                            protector pads included in box.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pkg-highlight-card">
                    <span style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}>
                      🚚
                    </span>
                    <h4>Universal Int Studio White-Glove Promise</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Our dedicated logistics crew doesn't leave your boxes at the curb. We bring
                      each package directly into your chosen room, unbox the piece, complete
                      assembly, and carry away all recyclable packaging materials.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="tab-pane-content">
                <div className="warranty-grid">
                  <div className="warranty-card">
                    <span className="warranty-badge">{warrantyYears} YEARS</span>
                    <h4>Structural Frame Guarantee</h4>
                    <p>
                      We stand behind the craftsmanship of every piece. The solid timber frame,
                      structural joinery, and internal load-bearing members are covered against
                      manufacturing defects for a full decade.
                    </p>
                  </div>
                  <div className="warranty-card">
                    <span className="warranty-badge">30 DAYS</span>
                    <h4>In-Home Luxury Trial</h4>
                    <p>
                      Experience the piece in your own home with your own lighting and furnishings.
                      If it does not harmonize with your interior, arrange an exchange or return
                      within 30 days.
                    </p>
                  </div>
                  <div className="warranty-card">
                    <span className="warranty-badge">LIFETIME</span>
                    <h4>Refurbishment Support</h4>
                    <p>
                      Because our furniture is made of solid woods rather than disposable particle
                      boards, Universal Int Studio offers lifetime restoration guidance and spare
                      hardware access.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="section-header" style={{ marginBottom: '32px' }}>
              <div>
                <span className="section-eyebrow">Harmonious Pairings</span>
                <h2 className="h3">More from the {category_name} Collection</h2>
              </div>
              <Link href={`/shop?category=${category_slug}`} className="btn btn-ghost btn-sm">
                View all in {category_name} →
              </Link>
            </div>
            <div className="grid-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal for Fullscreen Photo Inspection ── */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close-btn" onClick={() => setLightboxOpen(false)}>
            ✕
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={images[activeImg]} alt={name} className="lightbox-img" />
            {totalPhotos > 1 && (
              <div className="lightbox-controls">
                <button className="lightbox-nav-btn" onClick={handlePrevImg}>
                  ‹
                </button>
                <span className="lightbox-counter">
                  {activeImg + 1} of {totalPhotos}
                </span>
                <button className="lightbox-nav-btn" onClick={handleNextImg}>
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bespoke Dimension / Quote Drawer Modal ── */}
      {customQuoteOpen && (
        <div className="quickview-overlay" onClick={() => setCustomQuoteOpen(false)}>
          <div className="custom-quote-modal" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close-btn" onClick={() => setCustomQuoteOpen(false)}>
              ✕
            </button>
            <div style={{ padding: '32px' }}>
              <span className="section-eyebrow">Bespoke Workshop</span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  margin: '8px 0 16px',
                }}
              >
                Custom Order Inquiry: {name}
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}
              >
                Need specific dimensions to fit an architectural niche, or want a custom timber
                finish or leather upholstery? Our master artisans will review your floor plan and
                provide a custom quote within 24 hours.
              </p>

              {quoteSubmitted ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(74, 222, 128, 0.15)',
                      color: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: '24px',
                    }}
                  >
                    ✓
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      marginBottom: '8px',
                    }}
                  >
                    Inquiry Received!
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                    Our design consultant will contact you at{' '}
                    <strong>{quoteForm.email || quoteForm.phone}</strong> with technical drawings
                    and quote.
                  </p>
                  <button className="btn btn-outline" onClick={() => setCustomQuoteOpen(false)}>
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleQuoteSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div>
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. Priya Sharma"
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '6px',
                        }}
                      >
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        className="input"
                        placeholder="+91 98765 43210"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="you@domain.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Requested Dimensions (e.g. W 220 × D 90 × H 75 cm)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder={`Current standard is: ${dimensions}`}
                      value={quoteForm.customDims}
                      onChange={(e) => setQuoteForm({ ...quoteForm, customDims: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Custom Timber, Fabric or Architecture Notes
                    </label>
                    <textarea
                      rows={3}
                      className="input"
                      placeholder="e.g. Looking for a darker smoked walnut stain, or matching dining chairs."
                      value={quoteForm.notes}
                      onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setCustomQuoteOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={quoteSubmitting}
                    >
                      {quoteSubmitting ? 'Submitting...' : 'Send Custom Inquiry →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
