import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { readBaseline, excluded } from '../book_inventory.mjs';
import { prepareBookBusiness } from './business.mjs';

export function prepareBook(root, sandbox, copy) {
    const path = name => join(sandbox, name);
    const put = (name, text) => { mkdirSync(dirname(path(name)), { recursive: true }); writeFileSync(path(name), text); };
    cpSync(path('tests/regression.lpc'), path('tests/cloth_regression.lpc'));
    cpSync(join(root, 'tools/tests/book/regression.lpc'), path('tests/regression.lpc'));
    cpSync(join(root, 'tools/tests/book/checks.h'), path('tests/book_checks.h'));
    for (const name of ['tests/master.lpc', 'tests/benchmark.lpc'])
        writeFileSync(path(name), readFileSync(path(name), 'utf8').replaceAll('CLOTH', 'BOOK'));
    writeFileSync(path('tests/master.lpc'), readFileSync(path('tests/master.lpc'), 'utf8')
        + '\nprivate mapping counts = ([]);\nvoid record_setup(object ob) { counts[ob]++; }\nint setup_count(object ob) { return counts[ob]; }\n');
    if (!process.argv.includes('--bench')) {
        const parent = path('inherit/item/item.c');
        writeFileSync(parent, readFileSync(parent, 'utf8').replace('void setup() {',
            'void setup() {\n    master()->record_setup(this_object());'));
    }
    writeFileSync(path('tests/book_cases.json'), JSON.stringify(readBaseline().varieties.map(row => ({
        old_path: row.old_path, new_path: row.new_path, id: row.id, weight: Number(row.weight),
        name_choices: row.name_choices, skill_choices: row.skill_choices, jing_cost_random: row.jing_cost_random,
    }))));
    for (const file of excluded) copy(file);
    const recipe = path('d/wudu/obj/dujing1.c');
    writeFileSync(recipe, readFileSync(recipe, 'utf8').replace('return notify_fail(', 'return test_notify_fail('));
    copy('cmds/skill/study.c');
    cpSync(join(root, 'tools/tests/book/actor.lpc'), path('tests/book_actor.lpc'));
    // The actual study command runs unchanged. Only unrelated player/skill services are controlled.
    const names = new Set(readBaseline().observations?.map(row => row.clone.skill.name) || []);
    for (const row of readBaseline().varieties) for (const name of row.skill_choices) names.add(name);
    for (const name of names) put(`kungfu/skill/${name}.lpc`,
        'int valid_learn(object me) { return !me->query("test/deny_skill"); }\nstring query_skill_name(int level) { return 0; }\n');
    put('cmds/skill/learn.lpc', 'int can_learn(object me, string skill) { return !me->query("test/deny_learn"); }\n');
    put('tests/unknown_book.lpc', 'inherit ITEM;\nvoid create() { set_name("未知书", ({ "unknown book" })); set("unit", "本"); }\nobject create_virtual_object(string key) { return new("/tests/unknown_book"); }\n');
    const master = path('tests/master.lpc');
    writeFileSync(master, readFileSync(master, 'utf8') + `
private int random_bound = -1;
private string notice;
void record_notice(string text) { notice = text; }
string query_notice() { return notice; }
private mapping random_counts = ([]);
void set_random_bound(int bound) { random_bound = bound; }
int random_count(object ob) { return random_counts[ob]; }
int book_random(object ob, int size) {
    random_counts[ob]++;
    return random_bound < 0 ? random(size) : random_bound ? size - 1 : 0;
}
`);
    const sefun = path('tests/sefun.lpc');
    writeFileSync(sefun, readFileSync(sefun, 'utf8') + '\nint test_random(int size) { return master()->book_random(previous_object(), size); }\n'
        + 'int test_notify_fail(string text) { master()->record_notice(text); return notify_fail(text); }\n');
    if (!process.argv.includes('--baseline-only') && !process.argv.includes('--bench')) prepareBookBusiness(root, sandbox, copy);
    else put('tests/book_business.h', 'void check_book_business() {}\n');
}

export function finishBook(sandbox, rows) {
    if (process.argv.includes('--bench')) return;
    for (const file of [...rows.map(row => row.old_path.slice(1) + '.c'), 'd/items/book.lpc']) {
        const target = join(sandbox, file);
        if (existsSync(target)) writeFileSync(target, readFileSync(target, 'utf8').replace(/\brandom\(/g, 'test_random('));
    }
}
