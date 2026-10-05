// Temporary business shells preserve selected real methods, not a second game implementation.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { readBaseline } from '../equip_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';

export function prepareEquip(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
    };
    const method = (source, signature) => {
        const start = source.indexOf(signature), end = source.indexOf('\n}', start) + 2;
        assert.ok(start >= 0 && end > start, signature);
        return source.slice(start, end);
    };
    const baseline = readBaseline(), npcs = [];
    for (const [file, frozen] of Object.entries(baseline.callers)) {
        if (file === 'd/city/npc/zeng.c') continue;
        const source = method(frozen, 'void create()'), syntax = tokens(source);
        const hits = baseline.hits.filter(h => h.file === file);
        const statements = []; let depth = 0, begin = 0;
        for (let i = 0; i < syntax.length; i++) {
            const t = syntax[i];
            if (t.text === '{') { depth++; if (depth === 1) begin = i + 1; }
            if (t.text === '}') depth--;
            if (depth === 1 && ['set', 'set_temp', 'carry_object'].includes(t.text)) begin = i;
            if (t.text !== ';' || depth !== 1) continue;
            const part = source.slice(syntax[begin].start, t.end);
            const selected = hits.some(h => part.includes(h.expression));
            if (selected) {
                assert.match(part, /^carry_object\([\s\S]+\)->wear\(\);$/);
                statements.push(part);
            } else if (/^set(?:_temp)?\("(?:gender|apply\/)/.test(part)) statements.push(part);
            begin = i + 1;
        }
        assert.equal(statements.filter(s => s.startsWith('carry_object')).length, hits.length, file);
        const name = 'tests/equip_npc_' + npcs.length;
        npcs.push({ file, fixture: '/' + name, count: hits.length });
        for (const old of [true, false]) {
            let body = statements.join('\n');
            if (!old) for (const hit of hits) body = body.replaceAll(hit.expression, JSON.stringify(hit.new_path));
            body = body.replaceAll('__DIR__', JSON.stringify('/' + posix.dirname(file) + '/'));
            put((old ? 'tests/old/' : '') + name + '.lpc', 'inherit "/tests/actor";\n'
                + 'void create() { ::create();\n' + body + '\n}\n');
        }
    }
    assert.equal(npcs.length, 24); assert.equal(npcs.reduce((sum, n) => sum + n.count, 0), 40);
    put('tests/equip-npcs.json', JSON.stringify(npcs));
    const dealer = readFileSync(join(root, 'feature/dealer.c'), 'utf8');
    for (const old of [true, false]) {
        const source = old ? baseline.callers['d/city/npc/zeng.c'] : readFileSync(join(root, 'd/city/npc/zeng.c'), 'utf8');
        put((old ? 'tests/old/' : '') + 'tests/equip_vendor.lpc', '#include <ansi.h>\n'
            + 'inherit "/tests/village_npc";\ninherit F_DEALER;\n'
            + 'void map_skill(string skill, string mapped) {}\nstring ask_job() { return ""; }\n'
            + 'private string displayed;\nvoid fixture_printf(string format, string text) { displayed = sprintf(format, text); }\n'
            + 'string query_display() { return displayed; }\n#define printf fixture_printf\n'
            + method(dealer, 'int do_list(string arg) {') + '\n'
            + method(source, 'void create() {').replaceAll('__DIR__', '"/d/city/npc/"') + '\n');
    }
    const mengzhu = readFileSync(join(root, 'clone/npc/meng-zhu.c'), 'utf8');
    put('tests/mengzhu.lpc', '#include <ansi.h>\n#define MENGZHU "/data/npc/meng-zhu"\n'
        + 'inherit "/tests/village_npc";\ninherit F_SAVE;\n'
        + method(mengzhu, 'string query_save_file() {') + '\n' + method(mengzhu, 'void create() {') + '\n');
    mkdirSync(join(sandbox, 'data/npc'), { recursive: true });
}
