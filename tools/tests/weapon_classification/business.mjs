// Reuse real transaction/storage regression helpers in a disposable mudlib.
import { cpSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function prepareBusiness(root, sandbox, put, method) {
    const read = file => readFileSync(join(root, file), 'utf8');
    cpSync(join(root, 'clone/money'), join(sandbox, 'clone/money'), { recursive: true });
    for (const file of ['adm/daemons/moneyd.c', 'clone/misc/bandage.c']) put(file, read(file));
    for (const file of ['vendor.lpc', 'player_shop.lpc', 'room.lpc'])
        put('tests/' + file, read('tools/tests/cloth/' + file));
    put('tests/trade_actor.lpc', read('tools/tests/cloth/actor.lpc'));
    put('adm/daemons/shopd.lpc', read('tools/tests/cloth/shopd.lpc'));
    put('tests/cloth_regression.lpc', read('tools/tests/cloth/regression.lpc')
        .replaceAll('"/tests/actor"', '"/tests/trade_actor"'));
    put('tests/weapon_business.lpc', read('tools/tests/weapon_classification/business.lpc'));
    let transactions = '#include <ansi.h>\n#include <config.h>\n'
        + 'private int player_pay(object who, object target, int amount);\n'
        + 'private void destruct_it(object ob);\n';
    for (const signature of ['public string do_stock(object ob, object me, string arg)',
        'public string do_unstock(object ob, object me, string arg)',
        'public int do_buy(object obj, object me, string arg)',
        'private int player_pay(object who, object target, int amount)',
        'private void destruct_it(object ob)'])
        transactions += method('adm/daemons/shopd.c', signature);
    put('tests/shop_transactions.c', transactions);
}
