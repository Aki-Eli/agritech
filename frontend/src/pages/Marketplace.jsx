import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { FaShoppingCart, FaPlus, FaMinus, FaTrash, FaBox, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useToast } from '../components/Toast';

const Marketplace = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false); // prevents duplicate orders
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = filter === 'All' ? products : products.filter(p => p.category === filter);

  const cartCount = cart.reduce((s, p) => s + p.quantity, 0);
  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(p => p._id === product._id);
      return ex
        ? prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { ...product, quantity: 1 }];
    });
    toast(`${product.name} added to cart.`, 'success', 2000);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(p => p._id === id ? { ...p, quantity: qty } : p));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p._id !== id));

  const checkout = async () => {
    if (checkingOut) return;          // hard guard — ignore any extra clicks
    setCheckingOut(true);
    try {
      await axios.post('/api/orders', {
        products: cart.map(p => ({ productId: p._id, quantity: p.quantity }))
      });
      setCart([]);
      setShowCart(false);
      toast('Order placed successfully!', 'success', 4000);
    } catch (err) {
      toast(err.response?.data?.msg || 'Error placing order. Please try again.', 'danger');
    } finally {
      setCheckingOut(false);
    }
  };

  const cartQty = (id) => cart.find(p => p._id === id)?.quantity || 0;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Marketplace</h2>
          <p>Purchase seeds, fertilizers, pesticides, and equipment.</p>
        </div>
        <Button className="btn btn-primary" onClick={() => setShowCart(true)} style={{ position: 'relative' }}>
          <FaShoppingCart /> Cart
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#e76f51', color: '#fff',
              width: 18, height: 18, borderRadius: '50%',
              fontSize: '.65rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{cartCount}</span>
          )}
        </Button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '.35rem .9rem',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              borderColor: filter === cat ? 'var(--primary)' : 'var(--border)',
              background: filter === cat ? 'var(--primary)' : 'var(--surface)',
              color: filter === cat ? '#fff' : 'var(--text-secondary)',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner animation="border" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <Row className="g-3">
          {filtered.map(p => (
            <Col xs={12} sm={6} lg={4} xl={3} key={p._id}>
              <div className="product-card">
                <div style={{ height: 160, overflow: 'hidden', background: 'var(--surface-3)', position: 'relative' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="product-img"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${p._id}/300/160`; }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaBox style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  {p.category && (
                    <span style={{
                      position: 'absolute', top: 8, left: 8,
                      background: 'rgba(0,0,0,.55)', color: '#fff',
                      fontSize: '.65rem', fontWeight: 600, padding: '.2rem .55rem',
                      borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '.4px'
                    }}>{p.category}</span>
                  )}
                </div>
                <div className="product-body">
                  <h6 style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: '.25rem', color: 'var(--text-primary)' }}>{p.name}</h6>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.75rem', lineHeight: 1.5 }}>
                    {p.description?.slice(0, 70)}{p.description?.length > 70 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                    <span className="product-price">₱{p.price?.toLocaleString()}</span>
                    <span className="product-stock">
                      {p.stock > 0 ? `${p.stock} in stock` : <span style={{ color: 'var(--danger)' }}>Out of stock</span>}
                    </span>
                  </div>
                  {cartQty(p._id) > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => updateQty(p._id, cartQty(p._id) - 1)}>
                        <FaMinus />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '.85rem', minWidth: 24, textAlign: 'center' }}>{cartQty(p._id)}</span>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => addToCart(p)}>
                        <FaPlus />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm ms-auto" onClick={() => removeFromCart(p._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <Button
                      className="btn btn-primary w-100 btn-sm"
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                    >
                      <FaPlus /> Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          ))}
          {filtered.length === 0 && (
            <Col xs={12}>
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaBox style={{ fontSize: '2rem', marginBottom: '.75rem' }} />
                <p>No products found in this category.</p>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Cart Modal */}
      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Your Cart ({cartCount} items)</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FaShoppingCart style={{ fontSize: '2rem', marginBottom: '.75rem' }} />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map(p => (
              <div key={p._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-3)', flexShrink: 0 }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaBox style={{ color: 'var(--text-muted)' }} /></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>₱{p.price?.toLocaleString()} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => updateQty(p._id, p.quantity - 1)}>
                    <FaMinus />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center', fontSize: '.85rem' }}>{p.quantity}</span>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => updateQty(p._id, p.quantity + 1)}>
                    <FaPlus />
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', minWidth: 70, textAlign: 'right' }}>
                  ₱{(p.price * p.quantity).toLocaleString()}
                </div>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeFromCart(p._id)}>
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </Modal.Body>
        {cart.length > 0 && (
          <Modal.Footer style={{ justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              Total: <span style={{ color: 'var(--primary)' }}>₱{total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <Button className="btn btn-secondary" onClick={() => setShowCart(false)}>Continue Shopping</Button>
              <Button
                className="btn btn-primary"
                onClick={checkout}
                disabled={checkingOut}
                style={{ minWidth: 130 }}
              >
                {checkingOut
                  ? <><Spinner animation="border" size="sm" className="me-2" />Processing...</>
                  : <><FaCheckCircle className="me-1" />Place Order</>}
              </Button>
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default Marketplace;
