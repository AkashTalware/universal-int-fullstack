'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';
import ProductQuickView from './ProductQuickView';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const {
    id,
    name,
    slug,
    price,
    sale_price,
    images = [],
    category_name,
    category_slug,
    material,
    is_featured,
  } = product;

  const img = images?.[0];
  const hasSale = sale_price && sale_price < price;
  const discount = hasSale ? Math.round((1 - sale_price / price) * 100) : 0;
  const photoCount = images.length || 1;

  function handleAddToCart(e) {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleCardClick() {
    setQuickViewOpen(true);
  }

  return (
    <>
      <article
        className="product-card"
        id={`product-card-${id}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Image Wrap */}
        <div className="product-img-wrap">
          {img ? (
            <img
              src={img}
              alt={name}
              className="product-img"
              loading="lazy"
              onError={(e) => {
                if (images[1] && e.currentTarget.src !== images[1]) {
                  e.currentTarget.src = images[1];
                }
              }}
            />
          ) : (
            <div
              className="product-img"
              style={{
                background: 'var(--surface-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="40"
                height="40"
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

          {/* Obsidian Glass Category Badge */}
          {category_name && (
            <span className={`product-badge tag-glass tag-${category_slug || 'default'}`}>
              <span className="tag-gem" />
              <span className="tag-label">{category_name}</span>
            </span>
          )}

          {/* Obsidian Glass Sale Badge */}
          {hasSale && (
            <span className="product-sale-badge tag-glass tag-sale">
              <span className="tag-gem tag-gem-emerald" />
              <span className="tag-label">–{discount}%</span>
            </span>
          )}

          {/* Quick View Hover Pill with Photo Count */}
          <div className="product-quick-hint">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{photoCount > 1 ? `Browse ${photoCount} Photos` : 'Quick View'}</span>
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          <p className="product-cat">{category_name || 'Furniture'}</p>
          <h3
            className="product-name"
            style={{ display: 'block', transition: 'color var(--transition)' }}
          >
            {name}
          </h3>

          <div className="product-price-row">
            <span className="product-price">{formatPrice(hasSale ? sale_price : price)}</span>
            {hasSale && <span className="product-price-original">{formatPrice(price)}</span>}
          </div>

          {material && <p className="product-material">{material}</p>}

          <div className="product-actions">
            <button
              className={`btn ${added ? 'btn-added' : 'btn-outline'} w-full`}
              style={{ justifyContent: 'center', gap: '6px' }}
              onClick={handleAddToCart}
              id={`add-to-cart-${id}`}
              aria-label={`Add ${name} to cart`}
            >
              {added ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added!
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Carousel Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
