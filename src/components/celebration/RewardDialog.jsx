import { X, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/Celebration.css'; // RewardDialog styles live in Celebration.css

/**
 * RewardDialog — Modal al desbloquear un gadget
 *
 * Props:
 *   isOpen   {boolean}
 *   onClose  {fn}
 *   gadget   {object | null} — del gadgetsData catalog
 */
export default function RewardDialog({ isOpen, onClose, gadget }) {
    if (!isOpen || !gadget) return null;

    return (
        <div className="reward-dialog-backdrop" onClick={onClose}>
            <div
                className="reward-dialog"
                onClick={e => e.stopPropagation()}
            >
                {/* Fondo giratorio decorativo */}
                <div className="reward-dialog-bg" />

                {/* Botón cerrar */}
                <button className="reward-dialog-close" onClick={onClose} aria-label="Cerrar">
                    <X size={16} />
                </button>

                <div className="reward-dialog-content">
                    {/* Trofeo */}
                    <div className="reward-dialog-trophy">
                        <Zap size={36} />
                    </div>

                    <h2 className="reward-dialog-title">¡Recompensa Desbloqueada!</h2>

                    {/* Imagen / Emoji del gadget */}
                    <div className="reward-dialog-image-wrap">
                        <div className="reward-dialog-gadget-icon" style={{ fontSize: '2.5rem' }}>
                            {gadget.icon}
                        </div>
                    </div>

                    <p className="reward-dialog-gadget-name">{gadget.name}</p>
                    <p className="reward-dialog-gadget-desc">{gadget.description}</p>

                    {/* Acciones */}
                    <div className="reward-dialog-actions">
                        <Link
                            to={gadget.route || '/dashboard/gadgets'}
                            className="reward-dialog-btn-primary"
                            onClick={onClose}
                        >
                            <ExternalLink size={16} />
                            Ir a la Herramienta
                        </Link>
                        <button className="reward-dialog-btn-secondary" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
