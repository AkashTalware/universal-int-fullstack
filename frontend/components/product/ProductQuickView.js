'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';
import { getProductOptions } from '@/lib/productOptions';

export default function ProductQuickView({ product, isOpen, onClose }) {
  const { addItem } = useCart();
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Variant Options Provision
  const options = product
    ? getProductOptions(product)
    : { dimensions: [], materials: [], finishes: [] };
  const [selectedDim, setSelectedDim] = useState('');
  const [selectedMat, setSelectedMat] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Reset active image, quantity & selected options whenever product changes or modal opens
  useEffect(() => {
    if (isOpen && product) {
      setActiveIdx(0);
      setQty(1);
      setAdded(false);
      const opts = getProductOptions(product);
      setSelectedDim(opts.dimensions[0] || product.dimensions || '');
      setSelectedMat(opts.materials[0] || product.material || '');
      setSelectedFinish(opts.finishes[0] || product.finish || '');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  // Keyboard navigation: Escape to close, Left/Right arrows to flip images
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIdx, product]);

  if (!isOpen || !product) return null;

  const {
    id,
    name,
    slug,
    price,
    sale_price,
    images = [],
    category_name,
    category_slug,
    description,
    dimensions,
    material,
    finish,
    in_stock = 1,
  } = product;

  const hasSale = sale_price && sale_price < price;
  const currentPrice = hasSale ? sale_price : price;
  const discount = hasSale ? Math.round((1 - sale_price / price) * 100) : 0;
  const emiPerMonth = Math.round(currentPrice / 12);
  const totalImages = images.length || 1;

  // Mobile touch swipe gestures for carousel
  function handleTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }

  function handleTouchEnd(e) {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      // Minimum swipe distance of 36px and predominantly horizontal movement
      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  }

  function handlePrev(e) {
    e?.stopPropagation?.();
    setActiveIdx((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }

  function handleNext(e) {
    e?.stopPropagation?.();
    setActiveIdx((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }

  function handleAddToCart() {
    addItem(product, qty, {
      dimensions: selectedDim,
      material: selectedMat,
      finish: selectedFinish,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div
      className="quickview-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} Quick View`}
    >
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Mobile bottom-sheet drag handle */}
        <div className="quickview-sheet-handle" aria-hidden="true" />

        {/* Close Button */}
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close modal">
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="quickview-grid">
          {/* ── Left Column: Interactive Image Carousel ── */}
          <div className="quickview-carousel">
            <div
              className="quickview-main-img-wrap"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {images[activeIdx] ? (
                <img
                  src={images[activeIdx]}
                  alt={`${name} photo ${activeIdx + 1}`}
                  className="quickview-main-img"
                  onError={(e) => {
                    e.currentTarget.src = images[0] || '';
                  }}
                />
              ) : (
                <div className="quickview-placeholder">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-faint)"
                    strokeWidth="1"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}

              {/* Tag & Gem overlay on image */}
              {category_name && (
                <span className={`quickview-cat-badge tag-glass tag-${category_slug || 'default'}`}>
                  <span className="tag-gem" />
                  <span className="tag-label">{category_name}</span>
                </span>
              )}

              {hasSale && (
                <span className="quickview-sale-badge tag-glass tag-sale">
                  <span className="tag-gem tag-gem-emerald" />
                  <span className="tag-label">–{discount}%</span>
                </span>
              )}

              {/* Image Counter Badge */}
              {totalImages > 1 && (
                <div className="quickview-counter">
                  {activeIdx + 1} / {totalImages}
                </div>
              )}

              {/* Carousel Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    className="quickview-arrow quickview-arrow-left"
                    onClick={handlePrev}
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
                    className="quickview-arrow quickview-arrow-right"
                    onClick={handleNext}
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
            {totalImages > 1 && (
              <div className="quickview-thumbs">
                {images.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`quickview-thumb ${activeIdx === i ? 'active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${name} thumbnail ${i + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = images[0] || '';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Info & Options ── */}
          <div className="quickview-info">
            <div className="quickview-header">
              <span className="quickview-subhead">
                Universal Interior Collection • {category_name || 'Design'}
              </span>
              <h2 className="quickview-title">{name}</h2>
            </div>

            {/* Price Row */}
            <div className="quickview-price-box">
              <div className="quickview-price-row">
                <span className="quickview-price">{formatPrice(currentPrice)}</span>
                {hasSale && (
                  <>
                    <span className="quickview-price-orig">{formatPrice(price)}</span>
                    <span className="quickview-save-tag">Save {discount}%</span>
                  </>
                )}
              </div>
              <p className="quickview-emi">
                💳 Or ₹{emiPerMonth.toLocaleString('en-IN')}/mo at 0% EMI with flexible tenure
              </p>
            </div>

            {description && <p className="quickview-desc">{description}</p>}

            {/* ── Configurable Variant Options & Specifications ── */}
            <div className="quickview-options-box">
              {/* Dimensions Selector */}
              {options.dimensions.length > 1 ? (
                <div className="quickview-option-group">
                  <div className="quickview-option-header">
                    <span className="quickview-option-label">📐 Dimensions / Sizing</span>
                  </div>
                  <div className="quickview-select-wrap">
                    <select
                      className="quickview-select"
                      value={selectedDim}
                      onChange={(e) => setSelectedDim(e.target.value)}
                      aria-label="Select Dimensions"
                    >
                      {options.dimensions.map((dim) => (
                        <option key={dim} value={dim}>
                          {dim}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                dimensions && (
                  <div className="quickview-spec-chip">
                    <span className="quickview-spec-label">📐 Dimensions</span>
                    <span className="quickview-spec-val">{selectedDim || dimensions}</span>
                  </div>
                )
              )}

              {/* Material Selector */}
              {options.materials.length > 1 ? (
                <div className="quickview-option-group">
                  <div className="quickview-option-header">
                    <span className="quickview-option-label">🪵 Material Specification</span>
                  </div>
                  <div className="quickview-select-wrap">
                    <select
                      className="quickview-select"
                      value={selectedMat}
                      onChange={(e) => setSelectedMat(e.target.value)}
                      aria-label="Select Material"
                    >
                      {options.materials.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                material && (
                  <div className="quickview-spec-chip">
                    <span className="quickview-spec-label">🪵 Material</span>
                    <span className="quickview-spec-val">{selectedMat || material}</span>
                  </div>
                )
              )}

              {/* Finish Selector */}
              {options.finishes.length > 1 ? (
                <div className="quickview-option-group">
                  <div className="quickview-option-header">
                    <span className="quickview-option-label">🎨 Surface Finish</span>
                  </div>
                  <div className="quickview-select-wrap">
                    <select
                      className="quickview-select"
                      value={selectedFinish}
                      onChange={(e) => setSelectedFinish(e.target.value)}
                      aria-label="Select Finish"
                    >
                      {options.finishes.map((fsh) => (
                        <option key={fsh} value={fsh}>
                          {fsh}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                finish && (
                  <div className="quickview-spec-chip">
                    <span className="quickview-spec-label">🎨 Finish</span>
                    <span className="quickview-spec-val">{selectedFinish || finish}</span>
                  </div>
                )
              )}

              {/* Delivery & Availability */}
              <div className="quickview-spec-chip">
                <span className="quickview-spec-label">📦 Delivery & Availability</span>
                <span
                  className="quickview-spec-val"
                  style={{ color: in_stock ? '#4ade80' : 'var(--danger)' }}
                >
                  {in_stock ? '● In Stock — Dispatched in 3–5 business days' : '○ Made to Order'}
                </span>
              </div>

              {/* Bespoke / Custom request note */}
              <div className="quickview-custom-hint">
                <span>💡 Need bespoke sizing, custom fabric, or alternate stain?</span>
                <Link href={`/shop/${slug}`} onClick={onClose} className="quickview-custom-link">
                  Request Custom Quote →
                </Link>
              </div>
            </div>

            {/* ── Quantity & Cart Actions (Flush Aligned) ── */}
            <div className="quickview-action-group">
              <div className="quickview-qty-row">
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
                  className={`btn ${added ? 'btn-added' : 'btn-primary'} quickview-add-cart-btn`}
                  onClick={handleAddToCart}
                  disabled={!in_stock}
                  id="quickview-add-cart"
                >
                  {added ? (
                    <>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Full Details CTA */}
              <Link
                href={`/shop/${slug}`}
                onClick={onClose}
                className="btn btn-outline w-full quickview-detail-cta"
              >
                <span>View Full Product Details & Blueprint</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
