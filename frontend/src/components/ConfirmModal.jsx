import React, { createContext, useContext, useState, useCallback, memo } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

/* ── Context holds only the stable `confirm` function ── */
const ConfirmContext = createContext(null);

const VARIANT_COLORS = {
  danger:  { btn: 'btn btn-danger',  iconBg: '#fee2e2', iconColor: '#b91c1c' },
  warning: { btn: 'btn btn-warning', iconBg: '#fef9c3', iconColor: '#a16207' },
};

/* ── Modal UI — isolated in its own component so its state
   changes never re-render the app tree ── */
const ConfirmDialog = memo(({ stateRef, onClose }) => {
  const [state, setState] = useState({ open: false, message: '', variant: 'danger' });

  // Expose open() to the provider via the ref
  React.useEffect(() => {
    stateRef.current = {
      open: (message, variant, resolve) => {
        setState({ open: true, message, variant, resolve });
      },
    };
  }, [stateRef]);

  const handleClose = (result) => {
    state.resolve?.(result);
    setState(s => ({ ...s, open: false }));
  };

  const vc = VARIANT_COLORS[state.variant] || VARIANT_COLORS.danger;

  return ReactDOM.createPortal(
    <Modal show={state.open} onHide={() => handleClose(false)} centered size="sm">
      <Modal.Body style={{ padding: '2rem 1.75rem', textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: vc.iconBg, color: vc.iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', margin: '0 auto 1.1rem',
        }}>
          <FaExclamationTriangle />
        </div>
        <p style={{ fontSize: '.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          {state.message}
        </p>
      </Modal.Body>
      <Modal.Footer style={{ justifyContent: 'center', gap: '.5rem', paddingTop: 0, border: 'none' }}>
        <Button className="btn btn-secondary btn-sm" onClick={() => handleClose(false)}>
          Cancel
        </Button>
        <Button className={`${vc.btn} btn-sm`} onClick={() => handleClose(true)}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>,
    document.body
  );
});

/* ── Provider — renders children once, never re-renders them ── */
export const ConfirmProvider = ({ children }) => {
  const stateRef = React.useRef(null);

  const confirm = useCallback((message, variant = 'danger') =>
    new Promise(resolve => {
      stateRef.current?.open(message, variant, resolve);
    }),
  []); // empty deps — stable forever

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog stateRef={stateRef} />
    </ConfirmContext.Provider>
  );
};

/* ── Hook ── */
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
};
