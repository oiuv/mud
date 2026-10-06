// Disposable adapters execute the selected game methods; no live server or saves.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readBaseline } from '../staff_inventory.mjs';
import { tokens } from '../cloth_inventory.mjs';

export function prepareBusiness(root, sandbox) {
    const put = (file, source) => {
        mkdirSync(dirname(join(sandbox, file)), { recursive: true });
        writeFileSync(join(sandbox, file), source);
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
        const equips = data.hits.filter(h => h.file === file && /carry_object\s*\(\s*$/.test(frozen.slice(Math.max(0, h.start - 30), h.start))).map(h => {
            const begin = frozen.lastIndexOf('carry_object', h.start);
            const end = frozen.indexOf(';', h.end) + 1;
            const statement = frozen.slice(begin, end);
            assert.match(statement, /(?:->wield\(\))?;$/);
            return [begin, end];
        });
        for (const [ranges, list, type] of [[goods, shops, 'shop'], [equips, equipment, 'npc']]) {
            if (!ranges.length) continue;
            const hits = data.hits.filter(h => h.file === file && ranges.some(([a, b]) => h.start >= a && h.end <= b));
            if (!hits.length) continue;
            const fixture = 'tests/staff_' + type + '_' + list.length;
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
    assert.equal(shops.length, 9);
    assert.equal(equipment.length, 27);
    put('tests/staff-shops.json', JSON.stringify(shops));
    put('tests/staff-equipment.json', JSON.stringify(equipment));
    // Unchanged stock and other dynamic branches are copied only into this disposable fixture.
    const extras = new Set(['d/changan/npc/obj/changbian.c', 'd/changan/npc/obj/axe.c',
        'd/shaolin/obj/qimeigun.c', 'd/shaolin/obj/changbian.c']);
    for (const shop of shops) for (const token of tokens(data.callers[shop.file].replaceAll(
        '__DIR__', JSON.stringify('/' + dirname(shop.file).replaceAll('\\', '/') + '/')))) {
        if (token.kind !== 'string') continue;
        const value = JSON.parse(token.text);
        if (!value.startsWith('/d/items/') && !data.varieties.some(r => r.old_path === value)) {
            if (value.startsWith('/d/')) extras.add(value.slice(1) + '.c');
            else if (value.startsWith('obj/')) extras.add(dirname(shop.file).replaceAll('\\', '/') + '/' + value + '.c');
        }
    }
    for (const file of extras) if (existsSync(join(root, file))) put(file, read(file));
    // Extract unchanged real room stock statements, then test only this migration's entries.
    const rooms = [];
    for (const [file, frozen] of Object.entries(data.callers)) {
        if (!/inherit ROOM;/.test(frozen)) continue;
        const syntax = tokens(frozen);
        const ranges = syntax.flatMap((t, i) => t.text === 'set' && syntax[i + 2]?.text === '"objects"' ? [i] : []).map(start => {
            let end = start; while (syntax[end].text !== ';') end++;
            return [syntax[start].start, syntax[end].end];
        });
        const statement = ranges.map(([start, end]) => frozen.slice(start, end)).join('\n');
        const hits = data.hits.filter(h => h.file === file && ranges.some(([start, end]) => h.start >= start && h.end <= end));
        if (!hits.length) continue;
        const name = 'tests/staff_room_' + rooms.length;
        rooms.push({ file, fixture: '/' + name });
        for (const old of [true, false]) {
            let body = statement;
            if (!old) for (const hit of hits) body = body.replaceAll(hit.expression, JSON.stringify(hit.new_path));
            put((old ? 'tests/old/' : '') + name + '.lpc', 'inherit "/tests/room";\n#define random(n) (n - 1)\nvoid create() { ::create();\n'
                + body.replaceAll('__DIR__', JSON.stringify('/' + dirname(file).replaceAll('\\', '/') + '/')) + '\n}\n');
        }
    }
    assert.equal(rooms.length, 5);
    put('tests/staff-rooms.json', JSON.stringify(rooms));
    cpSync(join(root, 'tools/tests/staff/business.lpc'), join(sandbox, 'tests/staff_business.h'));
}
