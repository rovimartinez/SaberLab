/**
 * push-runner.js — Cockpit de Despliegue Visual SaberLab
 * Verifica el build, muestra los archivos modificados, pide el commit
 * y ejecuta git add → commit → push con animaciones y colores.
 */

import { exec } from 'child_process';
import * as readline from 'readline';

process.removeAllListeners('warning');

// ─── Colores ANSI ────────────────────────────────────────────────────────────
const C = {
    reset:   '\x1b[0m',
    bright:  '\x1b[1m',
    dim:     '\x1b[2m',
    cyan:    '\x1b[36m',
    magenta: '\x1b[35m',
    blue:    '\x1b[34m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    white:   '\x1b[37m',
};

// ─── Banner ──────────────────────────────────────────────────────────────────
function printBanner() {
    console.clear();
    console.log(`
${C.cyan}${C.bright}  ███████╗ █████╗ ██████╗ ███████╗██████╗ ██╗      █████╗ ██████╗ 
  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗
  ███████╗███████║██████╔╝█████╗  ██████╔╝██║     ███████║██████╔╝
  ╚════██║██╔══██║██╔══██╗██╔══╝  ██╔══██╗██║     ██╔══██║██╔══██╗
  ███████║██║  ██║██████╔╝███████╗██║  ██║███████╗██║  ██║██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝${C.reset}
     ${C.magenta}${C.bright}🚀 Cockpit de Despliegue — Git Push Inteligente 🚀${C.reset}
`);
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
class Spinner {
    constructor(text) {
        this.text = text;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIdx = 0;
        this.timer = null;
    }
    start() {
        this.timer = setInterval(() => {
            process.stdout.write(`\r  ${C.cyan}${this.frames[this.frameIdx]}${C.reset} ${this.text}   `);
            this.frameIdx = (this.frameIdx + 1) % this.frames.length;
        }, 80);
        return this;
    }
    succeed(msg) {
        clearInterval(this.timer);
        process.stdout.write(`\r  ${C.green}✓${C.reset} ${msg || this.text}\n`);
    }
    fail(msg) {
        clearInterval(this.timer);
        process.stdout.write(`\r  ${C.red}✖${C.reset} ${msg || this.text}\n`);
    }
}

// ─── Prompt interactivo ───────────────────────────────────────────────────────
function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// ─── Esperar tecla para cerrar ────────────────────────────────────────────────
function waitForKeypress() {
    return new Promise(resolve => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            resolve();
        });
    });
}

// ─── Ejecutar comando y capturar salida ───────────────────────────────────────
function run(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        exec(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, ...opts }, (err, stdout, stderr) => {
            if (err && !opts.allowError) return reject(new Error(stderr || stdout || err.message));
            resolve(stdout.trim());
        });
    });
}

// ─── Verificar git status ─────────────────────────────────────────────────────
async function getGitStatus() {
    const raw = await run('git status --porcelain', { allowError: true });
    if (!raw) return { files: [], summary: { added: 0, modified: 0, deleted: 0, total: 0 } };

    const files = raw.split('\n').filter(Boolean).map(line => {
        const code = line.substring(0, 2).trim();
        const file = line.substring(3);
        const type = code === '??' ? 'new' : code === 'D' ? 'deleted' : 'modified';
        return { code, file, type };
    });

    const summary = {
        added:    files.filter(f => f.type === 'new').length,
        modified: files.filter(f => f.type === 'modified').length,
        deleted:  files.filter(f => f.type === 'deleted').length,
        total:    files.length,
    };

    return { files, summary };
}

// ─── Imprimir archivos modificados ────────────────────────────────────────────
function printChangedFiles(files) {
    const MAX_SHOW = 30;
    const shown = files.slice(0, MAX_SHOW);

    console.log(`\n  ${C.white}${C.bright}📂 Archivos con cambios:${C.reset}`);
    console.log(`  ${C.dim}${'─'.repeat(64)}${C.reset}`);

    shown.forEach(({ type, file }) => {
        const icon  = type === 'new' ? '✚' : type === 'deleted' ? '✖' : '✎';
        const color = type === 'new' ? C.green : type === 'deleted' ? C.red : C.yellow;
        const label = type === 'new' ? 'NUEVO    ' : type === 'deleted' ? 'ELIMINADO' : 'CAMBIO   ';
        const shortFile = file.length > 52 ? '...' + file.slice(-49) : file;
        console.log(`  ${color}${icon} ${label}${C.reset}  ${C.dim}${shortFile}${C.reset}`);
    });

    if (files.length > MAX_SHOW) {
        console.log(`  ${C.dim}... y ${files.length - MAX_SHOW} archivo(s) más${C.reset}`);
    }
    console.log(`  ${C.dim}${'─'.repeat(64)}${C.reset}\n`);
}

// ─── Panel final ──────────────────────────────────────────────────────────────
function printSummary(summary, commitMsg, branch) {
    const repoUrl = 'https://github.com/rovimartinez/SaberLab';
    console.log(`
  ${C.green}${C.bright}╔══════════════════════════════════════════════════════════════╗
  ║           🎉  ¡CAMBIOS SUBIDOS EXITOSAMENTE!  🎉              ║
  ╚══════════════════════════════════════════════════════════════╝${C.reset}

  ${C.cyan}${C.bright}📝 Commit:${C.reset}    ${commitMsg}
  ${C.cyan}${C.bright}🌿 Rama:${C.reset}      ${branch}
  ${C.green}${C.bright}✚ Nuevos:${C.reset}    ${summary.added} archivo(s)
  ${C.yellow}${C.bright}✎ Cambios:${C.reset}   ${summary.modified} archivo(s)
  ${C.red}${C.bright}✖ Eliminados:${C.reset} ${summary.deleted} archivo(s)

  ${C.blue}${C.bright}🔗 Repositorio:${C.reset}  ${repoUrl}
  ${C.blue}${C.bright}📦 Ver commits:${C.reset}  ${repoUrl}/commits

  ${C.dim}──────────────────────────────────────────────────────────────${C.reset}
  ${C.yellow}💡 SaberLab ya está actualizado en la nube. ¡Excelente trabajo!${C.reset}
`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    printBanner();

    // 1. Verificar repositorio y rama activa
    let branch = 'main';
    try {
        branch = await run('git rev-parse --abbrev-ref HEAD');
    } catch {
        console.log(`  ${C.red}✖ No se encontró un repositorio Git en este directorio.${C.reset}\n`);
        process.exit(1);
    }

    console.log(`  ${C.cyan}${C.bright}📍 Repositorio:${C.reset} SaberLab  ${C.dim}|${C.reset}  ${C.green}${C.bright}🌿 Rama activa: ${branch}${C.reset}\n`);

    // 2. Verificar cambios pendientes
    const spStatus = new Spinner('Analizando cambios pendientes...').start();
    await new Promise(r => setTimeout(r, 500));
    const { files, summary } = await getGitStatus();
    spStatus.succeed(`Se detectaron ${summary.total} archivo(s) con cambios`);

    if (summary.total === 0) {
        console.log(`\n  ${C.green}✓ El repositorio está al día. No hay cambios que subir.${C.reset}\n`);
        console.log(`  ${C.dim}Presiona cualquier tecla para cerrar...${C.reset}\n`);
        await waitForKeypress();
        return;
    }

    // 3. Mostrar archivos modificados
    printChangedFiles(files);

    // 4. Pedir mensaje del commit
    console.log(`  ${C.cyan}${C.bright}📝 Escribe el mensaje del commit:${C.reset}\n`);
    const commitMsg = await prompt(`  ${C.bright}> ${C.reset}`);

    if (!commitMsg) {
        console.log(`\n  ${C.red}✖ El mensaje del commit no puede estar vacío. Operación cancelada.${C.reset}\n`);
        console.log(`  ${C.dim}Presiona cualquier tecla para cerrar...${C.reset}\n`);
        await waitForKeypress();
        return;
    }

    console.log();

    // 5. npm run build (verificación previa al push)
    const spBuild = new Spinner('Verificando compilación (npm run build)...').start();
    try {
        await run('npm run build', { timeout: 120000 });
        spBuild.succeed('Compilación exitosa — 0 errores');
    } catch (err) {
        spBuild.fail('Error de compilación. Corrige los errores antes de subir.');
        console.log(`\n  ${C.red}${err.message.slice(0, 400)}${C.reset}\n`);
        console.log(`  ${C.dim}Presiona cualquier tecla para cerrar...${C.reset}\n`);
        await waitForKeypress();
        return;
    }

    // 6. git add .
    const spAdd = new Spinner('Preparando archivos para GitHub (git add)...').start();
    try {
        await run('git add .');
        spAdd.succeed('Todos los archivos preparados en el área de staging');
    } catch (err) {
        spAdd.fail(`Error en git add: ${err.message}`);
        await waitForKeypress();
        process.exit(1);
    }

    // 7. git commit
    const spCommit = new Spinner(`Creando commit: "${commitMsg}"...`).start();
    try {
        await run(`git commit -m "${commitMsg.replace(/"/g, "'")}"`);
        spCommit.succeed(`Commit creado: "${commitMsg}"`);
    } catch (err) {
        spCommit.fail(`Error en git commit: ${err.message}`);
        await waitForKeypress();
        process.exit(1);
    }

    // 8. git push
    const spPush = new Spinner(`Subiendo a GitHub (rama: ${branch})...`).start();
    try {
        await run(`git push origin ${branch}`, { timeout: 180000 });
        spPush.succeed(`¡Push exitoso! Rama "${branch}" actualizada en GitHub`);
    } catch (err) {
        // Git suele enviar su telemetría (Counting objects, Writing objects) por stderr
        // Si el exit code fue 0, no es un error real.
        if (err.message && !err.message.includes('rejected') && !err.message.includes('error:') && (err.message.includes('Everything up-to-date') || err.message.includes('up to date'))) {
            spPush.succeed(`¡Push exitoso! Rama "${branch}" sincronizada con GitHub`);
        } else {
            spPush.fail(`Error en git push: ${err.message}`);
            await waitForKeypress();
            process.exit(1);
        }
    }

    // 9. Panel final
    printSummary(summary, commitMsg, branch);

    // 10. Esperar tecla para cerrar
    console.log(`  ${C.dim}Presiona cualquier tecla para cerrar...${C.reset}\n`);
    await waitForKeypress();
}

main().catch(async err => {
    console.log(`\n  ${C.red}✖ Error inesperado: ${err.message}${C.reset}\n`);
    console.log(`  ${C.dim}Presiona cualquier tecla para cerrar...${C.reset}\n`);
    await waitForKeypress();
    process.exit(1);
});
