import { readBaseline as whipBaseline } from '../whip_inventory.mjs';
// Disposable adapters execute the selected game methods; no live server or saves.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readBaseline } from '../axe_fork_pin_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';
import { normalizeWeaponReferences } from '../weapon_classification/normalization.mjs';

export function prepareBusiness(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), normalizeWeaponReferences(source));
    };
    const read = file => readFileSync(join(root, file), 'utf8');
    const data = readBaseline(), shops = [], equipment = [];
    // Preserve complete real stock statements, without executing unrelated NPC infrastructure.
    for (const [file, frozen] of Object.entries(data.callers)) {
        const syntax = tokens(frozen);
        const statements = key => syntax.flatMap((t, i) => t.text === 'set' && syntax[i + 2]?.text === JSON.stringify(key) ? [i] : []).map(start => {
            let end = start; while (syntax[end].text !== ';') end++;
            return [syntax[start].start, syntax[end].end];
        });
        const goods = statements('vendor_goods');
        let equips = data.hits.filter(h => h.file === file && /carry_object\s*\(\s*$/.test(frozen.slice(Math.max(0, h.start - 30), h.start))).map(h => {
            const begin = frozen.lastIndexOf('carry_object', h.start);
            const end = frozen.indexOf(';', h.end) + 1;
            const statement = frozen.slice(begin, end);
            assert.match(statement, /(?:->wield\(\))?;$/);
            return [begin, end];
        });
        if (equips.length) {
            // Once this NPC is selected, include its other original carried/worn equipment too.
            const constructorEnd = frozen.indexOf('\n}', frozen.indexOf('void create()'));
            equips = syntax.flatMap((token, i) => token.text === 'carry_object' && token.start < constructorEnd ? [i] : []).map(start => {
                let end = start; while (syntax[end].text !== ';') end++;
                return [syntax[start].start, syntax[end].end];
            });
        }
        for (const [ranges, list, type] of [[goods, shops, 'shop'], [equips, equipment, 'npc']]) {
            if (!ranges.length) continue;
            const hits = data.hits.filter(h => h.file === file && ranges.some(([a, b]) => h.start >= a && h.end <= b));
            if (!hits.length) continue;
            const fixture = 'tests/axe_fork_pin_' + type + '_' + list.length;
            list.push({ file, fixture: '/' + fixture, count: hits.length });
            for (const old of [true, false]) {
                let body = ranges.map(([a, b]) => frozen.slice(a, b)).join('\n');
                if (!old) for (const hit of hits) body = body.replaceAll(hit.expression, JSON.stringify(hit.new_path));
                body = body.replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/'));
                put((old ? 'tests/old/' : '') + fixture + '.lpc',
                    'inherit "/tests/village_npc";\n' + (type === 'shop' ? 'inherit F_DEALER;\n' : '')
                    + 'void create() { setup();\n' + body + '\n}\n');
            }
        }
    }
    assert.equal(shops.length, 3);
    assert.equal(equipment.length, 3);
    put('tests/axe_fork_pin-shops.json', JSON.stringify(shops));
    put('tests/axe_fork_pin-equipment.json', JSON.stringify(equipment));
    // Unchanged stock and other dynamic branches are copied only into this disposable fixture.
    const extras = new Set();
    for (const shop of [...shops, ...equipment]) for (const token of tokens(data.callers[shop.file].replaceAll(
        '__DIR__', JSON.stringify('/' + dirname(shop.file).replaceAll('\\', '/') + '/')))) {
        if (token.kind !== 'string' || !/^"(?:\/d\/|\/clone\/|obj\/)/.test(token.text)) continue;
        const value = JSON.parse(token.text);
        if (!value.startsWith('/d/items/') && !data.varieties.some(r => r.old_path === value)) {
            if (value.startsWith('/d/') || value.startsWith('/clone/')) extras.add(value.slice(1) + '.c');
            else if (value.startsWith('obj/')) extras.add(dirname(shop.file).replaceAll('\\', '/') + '/' + value + '.c');
        }
    }
    for (const file of extras) {
        const frozen = whipBaseline().varieties.find(row => row.old_path + '.c' === '/' + file);
        if (frozen) put(file, frozen.source);
        else if (existsSync(join(root, file))) put(file, read(file));
    }
    prepareTasks(root, sandbox, put);
    put('tests/axe_fork_pin_business.h', read('tools/tests/axe_fork_pin/business.lpc'));
}

function prepareTasks(root, sandbox, put) {
    const file = 'd/changan/npc/fujiang.c';
    for (const old of [true, false]) {
        const source = old ? readBaseline().callers[file] : readFileSync(join(root, file), 'utf8');
        put((old ? 'tests/old/' : '') + file,
            source.replace('inherit NPC;', 'inherit "/tests/village_npc";\n'
                + 'int fixture_random(int n) { return n == 5 ? master()->query_branch() : 0; }\n'
                + 'void set_skill(string key, int level) { set("fixture_skills/" + key, level); }\n#define random fixture_random')
                .replaceAll('__DIR__', '"/d/changan/npc/"'));
    }
    const master = join(sandbox, 'tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + '\nprivate int branch;\n'
        + 'void set_branch(int value) { branch = value; }\nint query_branch() { return branch; }\n');
    // These historical functions are commented out in the game. Exercise them
    // only here; this does not reactivate the retired logging task.
    const source = readFileSync(join(root, 'd/guanwai/famu.c'), 'utf8');
    const signatures = ['int start_work(object me, object ob)', 'private varargs int end_working(object me, object passive)',
        'int working(object me)', 'int coagent(object me)', 'int halt_working(object me, object who, int silent)'];
    let body = '#include <ansi.h>\ninherit ITEM;\n' + signatures.map(s => s + ';').join('\n') + '\n';
    for (const signature of signatures) {
        const start = source.indexOf(signature + '\n{'), end = source.indexOf('\n}', start);
        assert.ok(start >= 0 && end > start, 'Historical famu method: ' + signature);
        body += source.slice(start, end + 2) + '\n';
    }
    put('tests/famu.lpc', body);
    put('tests/famu_actor.lpc', 'inherit "/tests/actor";\n'
        + 'varargs void start_busy(mixed step, mixed halt) { set_temp("fixture_busy", 1); }\n'
        + 'void interrupt_me(object who, int silent) { delete_temp("fixture_busy"); }\n');
    put('d/guanwai/obj/saw.c', readFileSync(join(root, 'd/guanwai/obj/saw.c'), 'utf8'));
}
