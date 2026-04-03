import React, { useState } from 'react';

const Semaforo = () => {
    const [activeLight, setActiveLight] = useState('green');

    const stateMeta = {
        red: { title: 'Silencio', text: 'Momento de escuchar o evaluar.', className: 'red' },
        yellow: { title: 'Atención', text: 'Prepárense, observen instrucciones.', className: 'yellow' },
        green: { title: 'Participación', text: 'Pueden hablar, colaborar o avanzar.', className: 'green' }
    };

    const current = stateMeta[activeLight];

    return (
        <div className="traffic-widget">
            <div className="traffic-body">
                <button type="button" className={`traffic-light red ${activeLight === 'red' ? 'active' : ''}`} onClick={() => setActiveLight('red')} />
                <button type="button" className={`traffic-light yellow ${activeLight === 'yellow' ? 'active' : ''}`} onClick={() => setActiveLight('yellow')} />
                <button type="button" className={`traffic-light green ${activeLight === 'green' ? 'active' : ''}`} onClick={() => setActiveLight('green')} />
            </div>

            <div className={`traffic-status ${current.className}`}>
                <strong>{current.title}</strong>
                <p>{current.text}</p>
            </div>

            <div className="traffic-actions">
                <button type="button" onClick={() => setActiveLight('red')}>Rojo</button>
                <button type="button" onClick={() => setActiveLight('yellow')}>Amarillo</button>
                <button type="button" onClick={() => setActiveLight('green')}>Verde</button>
            </div>
        </div>
    );
};

export default Semaforo;

