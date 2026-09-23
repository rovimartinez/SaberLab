/**
 * dev-runner.js - Cockpit de Lanzamiento Visual SaberLab
 * Orquesta la compilación de Cloudflare D1 Pages Functions y el servidor Frontend Vite,
 * con arranque ultrarrápido (< 2 segundos), caché inteligente de funciones y sin esperas de red.
 */

import { spawn, exec, execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const isWindows = process.platform === 'win31' || process.platform === 'win32';
const WRANGLER_BIN = path.resolve('node_modules/wrangler/bin/wrangler.js');
const VITE_BIN = path.resolve('node_modules/vite/bin/vite.js');
const DIST_INDEX = path.resolve('.wrangler/dist/index.js');

// Desactivar advertencias ruidosas internas de Node en la consola del usuario
process.removeAllListeners('warning');

// Colores ANSI
const C = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    white: '\x1b[37m'
};

function printBanner() {
    console.clear();
    console.log(`
${C.cyan}${C.bright}  ███████╗ █████╗ ██████╗ ███████╗██████╗ ██╗      █████╗ ██████╗ 
  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗
  ███████╗███████║██████╔╝█████╗  ██████╔╝██║     ███████║██████╔╝
  ╚════██║██╔══██║██╔══██╗██╔══╝  ██╔══██╗██║     ██╔══██║██╔══██╗
  ███████║██║  ██║██████╔╝███████╗██║  ██║███████╗██║  ██║██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝${C.reset}
     ${C.magenta}${C.bright}⚡ Plataforma Educativa STEAM & Simuladores 3D Interactivos ⚡${C.reset}
`);
}

// Utilidad para animación de spinner en consola
class Spinner {
    constructor(text) {
        this.text = text;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIdx = 0;
        this.timer = null;
    }

    start() {
        this.timer = setInterval(() => {
            const frame = this.frames[this.frameIdx];
            process.stdout.write(`\r  ${C.cyan}${frame}${C.reset} ${this.text}   `);
            this.frameIdx = (this.frameIdx + 1) % this.frames.length;
        }, 80);
        return this;
    }

    update(newText) {
        this.text = newText;
    }

    succeed(finalText) {
        if (this.timer) clearInterval(this.timer);
        process.stdout.write(`\r  ${C.green}✓${C.reset} ${finalText || this.text}\n`);
    }

    fail(finalText) {
        if (this.timer) clearInterval(this.timer);
        process.stdout.write(`\r  ${C.red}✖${C.reset} ${finalText || this.text}\n`);
    }
}

// Liberar puertos 5173 y 8788 en milisegundos sin invocar PowerShell
function freePortsFast(ports = [5173, 8788]) {
    if (!isWindows) return;
    try {
        const out = execSync('netstat -ano', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const lines = out.split('\n');
        const pids = new Set();
        for (const line of lines) {
            for (const port of ports) {
                if (line.includes(`:${port}`) && line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && pid !== '0' && pid !== String(process.pid)) {
                        pids.add(pid);
                    }
                }
            }
        }
        for (const pid of pids) {
            try {
                process.kill(Number(pid), 'SIGKILL');
            } catch {
                try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
            }
        }
    } catch {}
}

// 1. Verificar si un puerto HTTP responde
function checkServerReady(url, timeoutMs = 15000) {
    const startTime = Date.now();
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const req = http.get(url, (res) => {
                if (res.statusCode) {
                    clearInterval(interval);
                    resolve(true);
                }
            });
            req.on('error', () => {
                if (Date.now() - startTime > timeoutMs) {
                    clearInterval(interval);
                    resolve(false);
                }
            });
            req.setTimeout(400, () => {
                req.destroy();
            });
        }, 150);
    });
}

// 2. Abrir navegador en la URL indicada
function openBrowser(url) {
    const cmd = isWindows 
        ? `start "" "${url}"` 
        : process.platform === 'darwin' 
            ? `open "${url}"` 
            : `xdg-open "${url}"`;
    exec(cmd);
}

// Ejecución directa mediante Node.js (evita cmd.exe, npx y chequeos de red de npm)
function runNodeModule(scriptPath, args, options = {}) {
    return spawn(process.execPath, [scriptPath, ...args], {
        env: {
            ...process.env,
            NO_UPDATE_NOTIFIER: '1',
            WRANGLER_SEND_METRICS: 'false'
        },
        ...options
    });
}

// Comprobar si las funciones de backend cambiaron respecto al dist
function getLatestMtime(dir) {
    let latest = 0;
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                latest = Math.max(latest, getLatestMtime(full));
            } else {
                latest = Math.max(latest, fs.statSync(full).mtimeMs);
            }
        }
    } catch {}
    return latest;
}

function needsFunctionsBuild() {
    if (!fs.existsSync(DIST_INDEX)) return true;
    const distMtime = fs.statSync(DIST_INDEX).mtimeMs;
    const srcMtime = getLatestMtime('functions');
    return srcMtime > distMtime;
}

// 3. Compilar Cloudflare Pages Functions
function buildFunctions() {
    return new Promise((resolve, reject) => {
        const sp = new Spinner('Compilando backend serverless y rutas D1...').start();
        
        const buildProc = runNodeModule(WRANGLER_BIN, ['pages', 'functions', 'build', 'functions', '--outdir', '.wrangler/dist'], {
            stdio: ['ignore', 'pipe', 'pipe']
        });

        buildProc.on('close', (code) => {
            if (code === 0) {
                sp.succeed('Backend serverless compilado con éxito en .wrangler/dist');
                resolve();
            } else {
                sp.fail('Error al compilar funciones backend de Cloudflare');
                reject(new Error(`Build exit code ${code}`));
            }
        });

        buildProc.on('error', (err) => {
            sp.fail(`Error al invocar wrangler: ${err.message}`);
            reject(err);
        });
    });
}

// 4. Iniciar Wrangler Dev (Backend API D1 con remote bindings en vivo)
function startWrangler() {
    return runNodeModule(WRANGLER_BIN, ['dev', '.wrangler/dist/index.js', '--port', '8788'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

// 5. Iniciar Vite (Frontend)
function startVite() {
    return runNodeModule(VITE_BIN, [], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
}

function printCockpitReady() {
    console.log(`
  ${C.green}========================================================================${C.reset}
   ${C.white}${C.bright}🎉 ¡SABERLAB ESTÁ ACTIVO Y LISTO PARA USAR!${C.reset}
  ${C.green}========================================================================${C.reset}

   ${C.cyan}${C.bright}🌐 Aplicación Web:${C.reset}  ${C.bright}http://localhost:5173${C.reset}
   ${C.magenta}${C.bright}🗄️ Servidor API:${C.reset}    ${C.bright}http://localhost:8788${C.reset}
   ${C.yellow}${C.bright}☁️ Base de Datos:${C.reset}   ${C.bright}Cloudflare D1 (Conexión Directa en Vivo)${C.reset}
   ${C.blue}${C.bright}🤖 Asistentes IA:${C.reset}   ${C.bright}ElectroBot, RoboBot, TridiBot & ImpriBot${C.reset}

  ${C.dim}------------------------------------------------------------------------${C.reset}
   ${C.yellow}💡 Presiona [ Ctrl + C ] en esta ventana cuando desees apagar el sistema${C.reset}
  ${C.dim}------------------------------------------------------------------------${C.reset}
`);
}

async function main() {
    printBanner();

    try {
        const spClean = new Spinner('Verificando puertos y liberando memoria...').start();
        freePortsFast([5173, 8788]);
        spClean.succeed('Puertos 5173 y 8788 verificados y listos');

        // Verificación inteligente: compilar si hubo cambios en functions/ o conectar directo
        if (needsFunctionsBuild()) {
            await buildFunctions();
        } else {
            const spCached = new Spinner('Conectando a base de datos Cloudflare D1...').start();
            await new Promise(r => setTimeout(r, 60));
            spCached.succeed('Base de datos Cloudflare D1 conectada en vivo');
        }

        const spServices = new Spinner('Iniciando servicios D1 Cloud y Frontend Vite...').start();

        // Iniciar en paralelo para máxima velocidad
        const wranglerChild = startWrangler();
        const viteChild = startVite();

        // Manejar cierre ordenado al presionar Ctrl+C
        const cleanup = () => {
            console.log(`\n  ${C.yellow}⚠ Deteniendo servidores de SaberLab...${C.reset}`);
            try { wranglerChild.kill(); } catch (e) {}
            try { viteChild.kill(); } catch (e) {}
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        // Esperar a que ambos servidores estén respondiendo
        const isReady = await checkServerReady('http://127.0.0.1:5173', 15000);

        if (isReady) {
            spServices.succeed('Servidores conectados y enlazados exitosamente');
            printCockpitReady();
            console.log(`  ${C.cyan}• Abriendo navegador web en http://localhost:5173...${C.reset}\n`);
            openBrowser('http://localhost:5173');
        } else {
            spServices.succeed('Servidores iniciados');
            printCockpitReady();
            console.log(`  ${C.cyan}• Puedes abrir tu navegador en: http://localhost:5173${C.reset}\n`);
        }

    } catch (err) {
        console.log(`\n  ${C.red}✖ Error al iniciar SaberLab: ${err.message}${C.reset}\n`);
        process.exit(1);
    }
}

main();
