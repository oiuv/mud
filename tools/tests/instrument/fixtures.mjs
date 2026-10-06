import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { families, readBaseline, retained, negatives } from '../instrument_inventory.mjs';
import { prepareInstrumentBusiness } from './business.mjs';

export function prepareInstrument(root, sandbox, copy) {
    const path = name => join(sandbox, name);
    const put = (name, text) => { mkdirSync(dirname(path(name)), { recursive: true }); writeFileSync(path(name), text); };
    cpSync(path('tests/regression.lpc'), path('tests/cloth_regression.lpc'));
    for (const file of ['regression.lpc', 'checks.h', 'actor.lpc'])
        cpSync(join(root, 'tools/tests/instrument', file), path('tests/instrument_' + file));
    cpSync(path('tests/instrument_regression.lpc'), path('tests/regression.lpc'));
    for (const file of ['tests/master.lpc', 'tests/benchmark.lpc'])
        put(file, readFileSync(path(file), 'utf8').replaceAll('CLOTH', 'INSTRUMENT'));
    put('tests/master.lpc', readFileSync(path('tests/master.lpc'), 'utf8') + `
private mapping counts = ([]);
private string music_text;
private object music_instrument;
void record_setup(object ob) { counts[ob]++; }
int setup_count(object ob) { return counts[ob]; }
void record_music(string text, object actor, object item) { music_text = text; music_instrument = item; }
string query_music_text() { return music_text; }
object query_music_instrument() { return music_instrument; }
void clear_music() { music_text = 0; music_instrument = 0; }
`);
    if (!process.argv.includes('--bench')) put('inherit/item/item.c',
        readFileSync(path('inherit/item/item.c'), 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    put('tests/instrument_cases.json', JSON.stringify(readBaseline().varieties.map(row => ({
        old_path: row.old_path, new_path: row.new_path, family: row.family,
        id: row.id, weight: Number(row.weight),
    }))));
    for (const file of [...retained, ...negatives]) copy(file);
    const techniques = { qin: 'tanqin-jifa', xiao: 'chuixiao-jifa', zheng: 'guzheng-jifa' };
    for (const family of families) {
        copy('kungfu/skill/' + techniques[family] + '.c');
        put('kungfu/skill/test-' + family + '.lpc',
            'int valid_enable(string skill) { return skill == "' + techniques[family] + '"; }\n'
            + 'void do_effect(object actor) { actor->record_effect(); }\n');
    }
    put('tests/unknown_instrument.lpc', 'inherit ITEM;\nvoid create() { set_name("未知乐器", ({ "unknown instrument" })); set("unit", "件"); setup(); }\nobject create_virtual_object(string key) { return new("/tests/unknown_instrument"); }\n');
    const sefun = readFileSync(path('tests/sefun.lpc'), 'utf8');
    const old = 'varargs void message_vision(string message, object actor, object target) {}';
    assert.ok(sefun.includes(old));
    put('tests/sefun.lpc', sefun.replace(old,
        'varargs void message_vision(string message, object actor, object target) { master()->record_music(message, actor, target); }'));
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench'))
        prepareInstrumentBusiness(root, sandbox, copy);
    else put('tests/instrument_business.h', 'void check_instrument_business() {}\n');
}
