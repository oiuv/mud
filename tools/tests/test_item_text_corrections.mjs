import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokens, root } from './cloth_inventory.mjs';
import { correctedItemText } from './item_text_corrections.mjs';
import { original } from './whip_inventory.mjs';

const oldText = '一股杀气直聂九霄';
const newText = '一股杀气直慑九霄';
const semantic = source => tokens(source).map(token => [token.kind, token.text]);

test('only the approved wield message is corrected, preserving formatting and other fields', () => {
    const text = 'HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，' + oldText + '。\\n" NOR';
    const corrected = text.replace(oldText, newText);
    assert.equal(correctedItemText('"wield_msg"', text), corrected);
    assert.equal(correctedItemText('"wield_msg"', corrected), corrected);
    for (const key of ['"long"', '"name"', '"id"', '"material"', '"value"'])
        assert.equal(correctedItemText(key, text), text, key);
    assert.equal(correctedItemText('"wield_msg"', '"普通持用提示。\\n"'), '"普通持用提示。\\n"');
});

test('all 38 migrated messages use corrected text without rewriting historical definitions', async () => {
    for (const [family, count] of [['sword', 13], ['blade', 10], ['hammer', 4], ['staff', 5], ['whip', 6]]) {
        const { canonicalGroups, renderDefinitions } = await import(`./${family}_inventory.mjs`);
        const oldMessages = canonicalGroups().flatMap(g => g.representative.properties)
            .filter(([key, value]) => key === '"wield_msg"' && value.includes(oldText));
        assert.equal(oldMessages.length, count, family + ' frozen definitions retain original text');
        const rendered = renderDefinitions();
        const current = readFileSync(join(root, `d/items/${family}_data.h`), 'utf8');
        assert.equal(current.includes(oldText), false, family);
        assert.equal(current.split(newText).length - 1, count, family);
        assert.deepEqual(semantic(current), semantic(rendered), family + ' regeneration retains correction');
    }
});

test('three remaining physical weapons change only the typo, not gameplay tokens', () => {
    for (const number of [4, 5, 10]) {
        const file = `d/death/obj/weapon${number}.c`;
        const before = original(file);
        const current = readFileSync(join(root, file), 'utf8');
        assert.equal(current.includes(oldText), false, file);
        assert.equal(current.split(newText).length - 1, 1, file);
        assert.deepEqual(semantic(current), semantic(before.replaceAll(oldText, newText)), file);
    }
});
