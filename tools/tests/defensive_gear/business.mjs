import { readBaseline as whipBaseline } from '../whip_inventory.mjs';
// Disposable adapters execute the selected game methods; no live server or saves.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readBaseline } from '../defensive_gear_inventory.mjs';
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
        let equips = data.hits.filter(h => h.file === file && /carry_object\s*\(\s*$/.test(frozen.slice(Math.max(0, h.start - 30), h.start))).map(h => {
            const begin = frozen.lastIndexOf('carry_object', h.start);
            const end = frozen.indexOf(';', h.end) + 1;
            const statement = frozen.slice(begin, end);
            assert.match(statement, /(?:->wear\(\))?;$/);
            return [begin, end];
        });
        if (equips.length) {
            // Once this NPC is selected, include its other original carried/worn equipment too.
            const constructorEnd = frozen.indexOf('\n}', frozen.indexOf('void create()'));
            equips = syntax.flatMap((token, i) => token.text === 'carry_object' && token.start < constructorEnd ? [i] : []).map(start => {
                let end = start; while (syntax[end].text !== ';') end++;
                let begin = start;
                while (begin > 0 && ![';', '{'].includes(syntax[begin - 1].text)) begin--;
                assert.ok(['carry_object', 'set_temp'].includes(syntax[begin].text), 'Review nested carry statement');
                return [syntax[begin].start, syntax[end].end];
            });
        }
        for (const [ranges, list, type] of [[goods, shops, 'shop'], [equips, equipment, 'npc']]) {
            if (!ranges.length) continue;
            const hits = data.hits.filter(h => h.file === file && ranges.some(([a, b]) => h.start >= a && h.end <= b));
            if (!hits.length) continue;
            const fixture = 'tests/defensive_gear_' + type + '_' + list.length;
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
    assert.equal(shops.length, 6);
    assert.equal(equipment.length, 4);
    put('tests/defensive_gear-shops.json', JSON.stringify(shops));
    put('tests/defensive_gear-equipment.json', JSON.stringify(equipment));
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
    cpSync(join(root, 'tools/tests/defensive_gear/business.lpc'), join(sandbox, 'tests/defensive_gear_business.h'));
}
