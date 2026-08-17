import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import '../../styles/Celebration.css';

/**
 * RewardBanner — Banner sutil que aparece en la parte superior al completar
 *
 * Props:
 *   show     {boolean}
 *   message  {string}
 *   desc     {string}
 *   duration {number} ms antes de auto-ocultar (default: 3500)
 */
export default function RewardBanner({
    show,
    message = 'Progreso guardado',
    desc = 'Tu lección fue marcada como completada.',
    duration = 3500,
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!show) { setVisible(false); return; }

        // Pequeño delay para que la transición CSS funcione
        const t1 = setTimeout(() => setVisible(true), 50);
        const t2 = setTimeout(() => setVisible(false), duration);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [show, duration]);

    return (
        <div className={`reward-banner ${visible ? 'visible' : ''}`}>
            <div className="reward-banner-icon">
                <CheckCircle size={20} />
            </div>
            <div className="reward-banner-text">
                <p className="reward-banner-title">{message}</p>
                <p className="reward-banner-desc">{desc}</p>
            </div>
        </div>
    );
}
