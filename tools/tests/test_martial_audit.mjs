// Source-only isolated driver regression; no production saves, sockets or model calls.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const driver = resolve(args.find(arg => !arg.startsWith('--')) || join(root, 'bin/driver.exe'));
const before = args.find(arg => arg.startsWith('--before='))?.slice('--before='.length);
const group = args.find(arg => arg.startsWith('--group='))?.slice('--group='.length);
// Freeze the audited revision so --before remains a useful negative control after commit.
const auditBaseline = 'd43c418f';
const repairBaseline = 'e54a7cd8847206c4e33581251c7dbaf4dda9bf3e';
const actionNameSkills = ['sougu-yingzhua', 'huashan-jian', 'yunlong-shou', 'jimie-zhua',
    'yingzhua-gong', 'dulong-shenzhua', 'yintuoluo-zhua', 'chongling-jian', 'yunlong-zhua',
    'kongming-quan', 'raozhi-roujian', 'yinlong-bian', 'xuanxu-dao'];
const baselineGroups = {
    closeout: ['adm/npc/referee.c', 'kungfu/class/murong/murongbo.c', 'kungfu/skill/force/xun.c',
        ...actionNameSkills.map(name => 'kungfu/skill/' + name + '.c'),
        ...['xiaoao-jianghu', 'meinv-quan', 'dugu-jiujian', 'qinna-shibada', 'shaolin-tantui',
            'xuantie-jian/dong', 'jian-jia', 'qingfu-shenfa'].map(name => 'kungfu/skill/' + name + '.c')],
    design_values: [],
    design_fixes: ['d/mingjiao/midao9.c', 'd/mingjiao/mishi.c',
        'kungfu/skill/hongye-daofa.c', 'kungfu/skill/shedao-qigong.c', 'kungfu/skill/shenlong-bashi.c',
        'kungfu/skill/dian-canghai.c', 'kungfu/skill/paiyun-shou.c', 'kungfu/skill/xiyu-tiezheng.c',
        'kungfu/skill/shenzhaojing.c', 'kungfu/skill/shenzhaojing/perform/wu.c',
        'kungfu/skill/shenzhaojing/perform/ying.c', 'kungfu/class/tiezhang/fen.c',
        'kungfu/class/mingjiao/daijisi.c', 'kungfu/class/lingjiu/sang.c',
        'kungfu/class/songshan/fei.c', 'kungfu/class/zhenyuan/wangjianjie.c',
        'kungfu/class/shaolin/wuming.c', 'kungfu/class/emei/zhou.c', 'kungfu/class/gumu/lin.c'],
    array_remove: ['adm/single/simul_efun/object.c'],
    array_remove_order: [],
    array_form: ['kungfu/skill/fanliangyi-dao.c'],
    array_exit: ['feature/move.c', 'feature/team.c', 'kungfu/skill/fanliangyi-dao/makearray.c'],
    last_ammo: ['kungfu/skill/tanzhi-shentong/po.c'],
    room_home: ['inherit/room/room.c'],
    freeze: ['kungfu/skill/bingxin-jue/freeze.c'],
    canhe: ['kungfu/skill/canhe-zhi.c', 'kungfu/skill/canhe-zhi/canhe.c'],
    canhe_action: ['kungfu/skill/canhe-zhi.c'],
    tanzhi_action: ['kungfu/skill/tanzhi-shentong.c'],
    taixuan: ['kungfu/skill/taixuan-gong/perform/xuan.c'],
    tao: ['kungfu/skill/chousui-zhang/tao.c', 'kungfu/skill/ruying-suixingtui/ruying.c'],
    energy: ['kungfu/skill/shenxing-baibian.c', 'kungfu/skill/qixing-bu.c',
        'kungfu/skill/shenxing-baibian/piao.c', 'kungfu/skill/biyun-xinfa/powerup.c',
        'kungfu/skill/jiasha-fumogong/zhe.c'],
    recovery: ['kungfu/condition/drunk.c', 'kungfu/skill/xiantian-gong/exert/hup.c',
        'kungfu/skill/xuedao-dafa/exert/resurrect.c', 'kungfu/skill/force/heal.c'],
    timing: ['kungfu/skill/jiuyin-shengong/perform/xin.c', 'kungfu/skill/chousui-zhang/tao.c'],
    yuxiao: ['kungfu/skill/yuxiao-jian.c'],
    cang: ['kungfu/skill/hujia-daofa/cang.c'],
    luoyan: ['kungfu/skill/luoyan-jian.c'],
    shenghuo: ['kungfu/skill/shenghuo-ling/can.c'],
    teaching: ['kungfu/class/jueqing/chi.c', 'kungfu/class/wudang/shan.c',
        'kungfu/class/shaolin/da-mo.c', 'kungfu/class/gumu/li.c',
        'kungfu/class/ouyang/ouyangfeng.c', 'kungfu/class/huashan/feng.c',
        'kungfu/skill/chilian-shenzhang/lian.c', 'kungfu/class/riyue/qin.c',
        'kungfu/class/shaolin/xuan-ci.c'],
    recruitment: ['kungfu/class/huashan/yue-buqun.c', 'kungfu/class/shaolin/da-mo.c'],
    combat_cost: ['kungfu/skill/rulai-zhang.c', 'kungfu/skill/jiechen-dao/xiuluo.c',
        'kungfu/skill/qingyun-bian/duan.c', 'kungfu/skill/wudu-shenzhang/shi.c'],
    npc_fixes: ['adm/npc/referee.c', 'adm/daemons/combatd.c', 'clone/cloth/qingyi.c',
        'kungfu/class/emei/zhou.c',
        'd/shaolin/fumoquan.c', 'kungfu/class/generate/chinese.c',
        'kungfu/class/huashan/cong-buqi.c', 'kungfu/class/mingjiao/fanyao.c',
        'kungfu/class/misc/laodao.c', 'kungfu/class/wudu/panxiuda.c',
        'kungfu/class/xiaoyao/wuyazi.c', 'kungfu/class/xuanming/wuwang.c', 'kungfu/class/xuanming/he.c',
        'kungfu/class/songshan/di.c', 'kungfu/class/henshan/mi.c',
        ...['ding', 'danqing', 'tubi', 'heibai', 'huang'].map(name => 'kungfu/class/meizhuang/' + name + '.c'),
        ...['azi', 'chuchen', 'dizi', 'shihou', 'tianlang'].map(name => 'kungfu/class/xingxiu/' + name + '.c'),
        'kungfu/class/ouyang/ouyangke.c', 'kungfu/class/murong/murongfu.c',
        'kungfu/class/murong/murongbo.c', 'kungfu/class/xuedao/shanyong.c',
        'kungfu/class/shang/ming.c', 'kungfu/class/taohua/feng.c',
        'kungfu/class/shaolin/xuan-nan.h', 'kungfu/class/shaolin/xuan-ku.h',
        'kungfu/class/shaolin/cheng-xin.c', 'kungfu/class/shaolin/cheng-xin2.c',
        'kungfu/class/tianlongsi/ben.h', 'kungfu/class/tianlongsi/kurong.c',
        'kungfu/skill/dugu-jiujian.c', 'kungfu/class/gumu/longnv.c'],
    fields: ['kungfu/skill/yuxiao-jian/qing.c', 'kungfu/skill/chousui-zhang.c',
        'kungfu/skill/fushang-neigong.c', 'kungfu/skill/jingang-buhuaiti/jingang.c',
        'kungfu/skill/jingang-zhi/san.c', 'kungfu/skill/jingzhong-bafa/bafa.c',
        'kungfu/skill/jiuyin-shengong/perform/zhang.c', 'kungfu/skill/lengyue-shengong.c',
        'kungfu/skill/qiankun-danuoyi/nuoyi.c', 'kungfu/skill/sun-finger/heal.c',
        'kungfu/skill/xiaoao-jianghu.c', 'kungfu/skill/xiyang-neigong.c',
        'kungfu/skill/xuanyuan-arrow.c', 'kungfu/skill/yaowang-miaoshu.c',
        'kungfu/skill/jiuyang-shengong.c', 'kungfu/skill/wushe-qu.c',
        'kungfu/skill/lingyuan-xinfa/break.c', 'kungfu/skill/dagou-bang.c',
        'kungfu/skill/qiankun-jian.c', 'kungfu/skill/yiyang-zhi.c',
        'kungfu/skill/wudang-jiuyang.c', 'inherit/condition/damo.c', 'inherit/condition/poison.c',
        'kungfu/skill/rulai-zhang.c', 'kungfu/skill/chongyang-shenzhang.c',
        'kungfu/skill/weituo-chu.c', 'kungfu/skill/fuhu-quan.c', 'kungfu/skill/meinv-quan.c',
        'kungfu/skill/jiuyin-shengong.c', 'kungfu/skill/jian-jia.c',
        'kungfu/skill/shexing-lifan/guiyuan.c', 'kungfu/skill/xuantie-jian/dong.c',
        'kungfu/skill/bingcan-duzhang.c', 'kungfu/skill/suxin-jian.c', 'kungfu/skill/sad-strike.c',
        ...['qingfu-shenfa', 'xuanyuan-arrow/baibu', 'wuluo-zhang', 'wuluo-zhang/bian',
            'piaoxu-zhang/piao', 'panlong-zhao/tan'].map(name => 'kungfu/skill/' + name + '.c')],
    state_cost: ['kungfu/skill/sun-finger/heal.c', 'kungfu/skill/yiyang-zhi/heal.c',
        'kungfu/skill/taiji-shengong/dian.c', 'kungfu/skill/longxiang/powerup.c',
        'kungfu/skill/longxiang-gong/exert/powerup.c', 'kungfu/skill/force/inspire.c',
        'kungfu/skill/yecha-gun/hongxia.c', 'kungfu/skill/qingyun-bian/duan.c',
        'kungfu/skill/jiechen-dao/xiuluo.c', 'kungfu/skill/wudu-shenzhang/shi.c',
        'kungfu/skill/sad-strike/xiao.c', 'kungfu/skill/huoyan-dao.c',
        'kungfu/skill/jiuyin-baiguzhao.c', 'kungfu/skill/dugu-jiujian/jue.c',
        'kungfu/skill/qiankun-danuoyi.c', 'kungfu/skill/sanku-shengong/roar.c'],
};
assert.ok(!before || baselineGroups[before], 'Unknown baseline group');
assert.ok(!group || baselineGroups[group], 'Unknown selected group');
assert.ok(!before || !group, 'Choose --before or --group, not both');
assert.notEqual(before, 'design_values', 'Use --before=design_fixes to compare the original action values');
const stateGroups = ['yuxiao', 'cang', 'luoyan'];
const baseline = before === 'shenghuo' ? '61d92f7c39449289f912c957d9d971daeccd775b'
    : ['canhe_action', 'tanzhi_action'].includes(before) ? 'af546461'
    : ['teaching', 'recruitment', 'state_cost', 'fields', 'npc_fixes', 'combat_cost', 'room_home',
        'array_remove', 'array_form', 'array_exit', 'last_ammo', 'design_fixes', 'closeout'].includes(before) ? repairBaseline
    : stateGroups.includes(before) ? '8aee0828' : auditBaseline;
const sandbox = mkdtempSync(join(tmpdir(), 'mud-martial-audit-'));
console.log('Isolated martial audit: ' + sandbox);
const source = file => readFileSync(join(root, file), 'utf8');
const production = file => before && baselineGroups[before].includes(file)
    ? execFileSync('git', ['show', baseline + ':' + file], { cwd: root, encoding: 'utf8' }) : source(file);
const put = (file, text) => {
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    writeFileSync(join(sandbox, file), text, 'utf8');
};
const git = (directory, args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
const teaching = !group && !before || ['teaching', 'recruitment', 'state_cost', 'fields', 'npc_fixes',
    'room_home', 'array_remove', 'array_remove_order', 'array_form', 'array_exit', 'last_ammo',
    'design_fixes', 'closeout'].includes(before || group);
const connectedTarget = !group && !before || ['teaching', 'state_cost', 'npc_fixes', 'fields', 'design_fixes'].includes(before || group);
const included = teaching ? /^(?:(?:adm|feature|include|inherit|kungfu|mudcore|std|clone|cmds)\/|d\/(?:items|shaolin|taohua|meizhuang|xiaoyao|xiyu|tianlongsi|xuanminggu|songshan|mingjiao)\/|d\/(?:gumu|baituo)\/obj\/)/
    : /^(?:adm|feature|include|inherit|kungfu|mudcore|std)\//;
const files = new Set([...git(root, ['ls-files', '-z']), ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']),
    ...git(join(root, 'mudcore'), ['ls-files', '-z']).map(file => 'mudcore/' + file)]);
for (const file of files) {
    if (!/\.(?:c|lpc|h)$/.test(file) || !included.test(file) || !existsSync(join(root, file))
        || file.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
    if (before === 'design_fixes' && file === 'kungfu/skill/tie-zhang/ying.lpc') continue;
    mkdirSync(dirname(join(sandbox, file)), { recursive: true });
    cpSync(join(root, file), join(sandbox, file));
}
for (const dir of ['tests', 'data', 'log']) mkdirSync(join(sandbox, dir), { recursive: true });
put('data/e2c_dict.o', source('data/e2c_dict.o')); // Only the public display dictionary.
if (teaching) put('adm/etc/nature/day_phase', source('adm/etc/nature/day_phase'));
const searchDestination = !group && !before || ['state_cost', 'closeout'].includes(before || group);
if (searchDestination)
    put('d/foshan/street3.c', 'inherit ROOM; void create() { set("short", "寻人验场"); }\n');
put('tests/before.txt', before || '');
put('tests/group.txt', before || group || '');
if (before) for (const file of baselineGroups[before]) put(file, production(file));
if (before === 'array_remove_order') {
    // The earlier order was never committed. Recreate only that ordering in the fixture.
    const file = 'adm/single/simul_efun/object.c';
    const body = 'void destruct(object ob) {\n';
    const hook = '    if (ob && ob->is_character())\n        ob->dismiss_martial_array();\n\n';
    const insertion = '    // A refused removal must not change an active formation.\n' + hook;
    const current = source(file);
    assert.equal(current.split(body).length, 2, 'Unique destruction entry');
    assert.equal(current.split(insertion).length, 2, 'Unique current formation dismissal');
    put(file, current.replace(insertion, '').replace(body, body + hook));
}
let masterSource = source('tools/tests/weapon_classification/startup_master.lpc')
    .replaceAll('WEAPON_STARTUP', 'MARTIAL_AUDIT')
    .replace('if (!caught) {', 'debug_message(sprintf("TEST TRACE: %O", details));\n    if (!caught) {')
    .replace('if (err) check(0, err);\n    finish();', 'if (err) { check(0, err); finish(); }');
// Initialization schedules cold checks with no command player, independent of logon context.
masterSource = masterSource.replace('object connect() { return 0; }',
    'private int cold_ready;\nobject connect() { return 0; }');
if (connectedTarget) {
    masterSource = masterSource.replace('object connect() { return 0; }',
        'private object connected_target;\n'
        + 'object connect() { return new("/tests/connected_actor"); }\n'
        + 'object query_connected_target() { return connected_target; }\n'
        + 'void register_connected_target(object ob) {\n'
        + '    if (previous_object() != ob || base_name(ob) != "/tests/connected_actor" || connected_target) return;\n'
        + '    connected_target = ob; if (cold_ready) call_out("run", 0);\n}\n');
    put('tests/connected_actor.lpc', source('tools/tests/martial_audit/connected_actor.lpc'));
}
masterSource = masterSource.replace('string *epilog(int flag) { call_out("run", 0); return ({}); }',
    'void cold_start() {\n    mixed err;\n'
    + '    err = catch(load_object("/tests/regression")->cold_load_checks());\n'
    + '    if (err) { check(0, err); finish(); return; }\n    cold_ready = 1;\n'
    + (connectedTarget ? '    if (connected_target) call_out("run", 0);\n' : '    call_out("run", 0);\n')
    + '}\nstring *epilog(int flag) { call_out("cold_start", 0); return ({}); }');
put('tests/master.lpc', masterSource);
for (const file of ['actor', 'control', 'combat', 'regression', 'state', 'shenghuo', 'sword',
    'canhe_action', 'tanzhi_action', 'teaching', 'recruitment', 'state_cost_fixes', 'field_fixes',
    'npc_fixes', 'referee_probe', 'combat_cost_fixes', 'teaching_perform', 'home_actor', 'design_fixes'])
    put('tests/' + file + '.lpc', source('tools/tests/martial_audit/' + file + '.lpc'));
// Boundary spy only: effects execute actual skill/character/attribute/damage code.
// Common combat resolution has its own real-driver suite; here record the exact
// arguments and in-effect attributes without additional combat energy consumption.
put('tests/actual_combat.c', production('adm/daemons/combatd.c').replaceAll('random(', '"/tests/control"->roll('));
put('adm/daemons/combatd.c', 'inherit "/tests/combat";\n');
// Synthetic ordinary actors only; never load deployment wizard/account records.
put('adm/daemons/securityd.c', 'int get_wiz_level(mixed ob) { return 0; }\n'
    + 'string get_status(mixed ob) { return "(player)"; }\n');
const randomFiles = ['canhe-zhi.c', 'canhe-zhi/canhe.c', 'tanzhi-shentong.c', 'bingxin-jue/freeze.c',
    'taixuan-gong/perform/xuan.c', 'taixuan-gong/xuan.c', 'chousui-zhang/tao.c',
    'ruying-suixingtui/ruying.c', 'jiasha-fumogong/zhe.c', 'jiuyin-shengong/perform/xin.c',
    'xuedao-dafa/exert/resurrect.c', 'yuxiao-jian.c', 'hujia-daofa/cang.c', 'luoyan-jian.c',
    'shenghuo-ling/can.c', 'shenghuo-shengong.c', 'chilian-shenzhang/lian.c',
    'sanku-shengong/roar.c', 'yecha-gun/hongxia.c', 'qingyun-bian/duan.c',
    'sad-strike/xiao.c', 'qiankun-danuoyi.c', 'jiuyin-baiguzhao.c', 'dugu-jiujian/jue.c',
    'tiexian-quan/tui.c', 'yuxiao-jian/qing.c', 'jingzhong-bafa/bafa.c',
    'jiuyin-shengong/perform/zhang.c', 'qiankun-danuoyi/nuoyi.c', 'jingang-zhi/san.c',
    'rulai-zhang.c', 'lingyuan-xinfa/break.c', 'wushe-qu.c', 'xuantie-jian/dong.c',
    'hongye-daofa.c', 'shedao-qigong.c', 'shenlong-bashi.c', 'tie-zhang/ying.lpc',
    'xiyu-tiezheng.c', 'suxin-jian/lian.c', 'bazhen-zhang/yin.c', 'qinna-shibada.c',
    'jiuyang-shengong.c', 'dagou-bang.c', 'qiankun-jian.c', 'yiyang-zhi.c',
    'chousui-zhang.c', 'bingcan-duzhang.c', 'suxin-jian.c', 'sad-strike.c', 'yinsuo-jinling/feng.c',
    'wuluo-zhang/bian.c', 'piaoxu-zhang/piao.c', 'panlong-zhao/tan.c',
    'xuanyuan-arrow/baibu.c', 'qingfu-shenfa.c', 'jiechen-dao/xiuluo.c', 'wudu-shenzhang/shi.c',
    'damo-jian/qingxin.c', 'damo-jian/luan.c', 'lingshe-zhangfa/wanshi.c',
    'yitian-zhang/zheng.c', 'dugu-jiujian/po.c', 'dugu-jiujian.c'];
for (const relative of randomFiles) {
    const file = 'kungfu/skill/' + relative;
    if (before === 'design_fixes' && relative === 'tie-zhang/ying.lpc') continue;
    let text = production(file);
    assert.ok(text.includes('random(') || text.includes('NewRandom('), 'RNG site: ' + file);
    text = text.replaceAll('random(', '"/tests/control"->roll(');
    if (['yuxiao-jian.c', 'luoyan-jian.c'].includes(relative)) {
        const site = 'NewRandom(i, 20, level / 5)';
        assert.equal(text.split(site).length, 2, 'Unique action selector: ' + relative);
        text = text.replace(site, '"/tests/control"->choose_action(i, 20, level / 5)');
    }
    if (['chousui-zhang.c', 'qiankun-jian.c', 'yiyang-zhi.c', 'bingcan-duzhang.c',
        'suxin-jian.c', 'sad-strike.c', 'hongye-daofa.c', 'shedao-qigong.c', 'qinna-shibada.c'].includes(relative)) {
        assert.ok(text.includes('NewRandom('), 'Missing controlled action selection: ' + file);
        text = text.replaceAll('NewRandom(', '"/tests/control"->choose_action(');
    }
    if (relative === 'jiuyin-shengong/perform/xin.c') {
        const site = 'call_out("remove_effs", times, target';
        assert.equal(text.split(site).length, 2, 'Unique asynchronous timing input');
        text = text.replace(site, 'call_out("remove_effs", "/tests/control"->effect_delay(target), target');
    }
    put(file, text);
}
if (teaching) {
    const file = 'kungfu/class/huashan/feng.c';
    put(file, production(file).replaceAll('random(', '"/tests/control"->roll('));
    const generated = 'kungfu/class/generate/chinese.c';
    const selector = 'init_family[random(sizeof(init_family))]';
    const generatedSource = production(generated);
    assert.equal(generatedSource.split(selector).length, 2, 'Unique generated family selector');
    put(generated, generatedSource.replace(selector, 'init_family["/tests/control"->roll(sizeof(init_family))]'));
    const command = 'cmds/skill/perform.c';
    put(command, production(command).replaceAll('random(', '"/tests/control"->roll('));
    const monk = 'kungfu/class/tianlongsi/kurong.c';
    put(monk, production(monk).replaceAll('random(', '"/tests/control"->roll('));
}
if (!group && !before || (before || group) === 'state_cost') {
    for (const file of ['kungfu/skill/longxiang/powerup.c', 'kungfu/skill/longxiang-gong/exert/powerup.c']) {
        const text = readFileSync(join(sandbox, file), 'utf8');
        const delay = /(:\),\s*)skill(\);)/g;
        assert.equal([...text.matchAll(delay)].length, 1, 'Unique original longxiang expiry delay: ' + file);
        put(file, text.replace(delay, (_, prefix, suffix) => prefix + '0' + suffix));
    }
}
if (!group && !before || (before || group) === 'npc_fixes') {
    for (const file of ['kungfu/class/shaolin/xuan-nan.h', 'kungfu/class/shaolin/xuan-ku.h']) {
        const text = readFileSync(join(sandbox, file), 'utf8');
        const delay = 'call_out("waiting", 1, me, wait_time)';
        if (!before) assert.equal(text.split(delay).length, 3, 'Two original monk waiting reschedule sites: ' + file);
        put(file, text.replaceAll(delay, 'call_out("waiting", 0, me, wait_time)'));
    }
}
{
    const file = 'kungfu/condition/damo_luanqi.c';
    put(file, production(file).replaceAll('random(', '"/tests/control"->roll('));
}
put('tests/controlled-inputs.json', JSON.stringify({ randomFiles,
    actionSelection: 'Listed NewRandom inputs are controlled in the isolated copy; bounds and parameters are recorded.',
    baseline: before === 'array_remove_order' ? 'Reconstructed pre-review hook order, not a Git baseline'
        : before ? baseline : null, group: before || group || 'all',
    timing: 'Xin remove_effs input, two longxiang expiry delays and two waiting reschedules per monk header are shortened in applicable groups; callback bodies remain production code.',
    extraRng: 'Feng teaching, generated-family selector, original perform command, Kurong, damo_luanqi and the separate full combat copy use the controlled input boundary.',
    connection: connectedTarget ? 'One isolated loopback connection creates a synthetic once-interactive actor; no authentication or restore_object.' : 'No test client connection.',
    actualCombat: 'test/real_combat forwards observed calls to the unmodified full combat bodies, with only RNG inputs controlled.',
    syntheticDestination: searchDestination ? '/d/foshan/street3 only; tests movement/output, not that original room.' : null,
}, null, 2));
const listener = createServer();
await new Promise((done, reject) => { listener.once('error', reject); listener.listen(0, '127.0.0.1', done); });
const port = listener.address().port;
await new Promise(done => listener.close(done));
put('driver.cfg', ['name : Martial Audit Regression', 'mud ip : 127.0.0.1', 'port number : ' + port,
    'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
    'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
    'include directories : /include:/mudcore/include', 'global include file : <globals.h>', 'gametick msec : 100',
].join('\n') + '\n');
const result = await new Promise((done, reject) => {
    const child = spawn(driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
    let output = '';
    let client;
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', data => {
        output += data;
        if (connectedTarget && !client && output.includes('Initializations complete.')) {
            client = createConnection({ host: '127.0.0.1', port });
            client.on('error', error => {
                if (error.code !== 'ECONNRESET') output += '\nTEST CONNECTION ERROR: ' + error.code;
            });
        }
    });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); client?.destroy(); done({ code, output }); });
});
put('driver-output.txt', result.output);
const debug = join(sandbox, 'log/debug.log');
const diagnostics = result.output + (existsSync(debug) ? readFileSync(debug, 'utf8') : '');
console.log(result.output.split(/\r?\n/).filter(line => /MARTIAL_AUDIT|SHENGHUO|FAIL:|error:|warning:|TEST TRACE/i.test(line)).join('\n'));
if (before) {
    assert.equal(result.code, 1, 'Old production code must fail this isolated regression');
    assert.ok(result.output.includes('MARTIAL_AUDIT FAIL') && result.output.includes('FAIL:'), 'Missing negative-control failure');
    const reviewLabels = {
        fields: ['MA-001', 'MA-002', 'MA-005', 'MA-010', 'MA-068', 'MA-082', 'MA-083',
            'MA-089', 'MA-095', 'MA-097', 'MA-111', 'MA-118', 'MA-124', 'MA-126', 'MA-127',
            'MA-132', 'MA-135', 'MA-137', 'MA-138', 'MA-139', 'MA-140', 'MA-141'],
        npc_fixes: ['MA-008.01', 'MA-021', 'MA-022', 'MA-032', 'MA-033', 'MA-035', 'MA-037.01',
            'MA-038.01', 'MA-042', 'MA-043', 'MA-044.01', 'MA-046', 'MA-047', 'MA-050', 'MA-052',
            'MA-053', 'MA-056', 'MA-059', 'MA-065', 'MA-066', 'MA-103', 'MA-104', 'MA-105',
            'MA-106', 'MA-108', 'MA-113', 'MA-119', 'MA-143'],
        state_cost: ['MA-007', 'MA-014/015', 'MA-064', 'MA-080', 'MA-084/086', 'MA-085', 'MA-131', 'MA-144'],
        combat_cost: ['MA-085', 'MA-089'],
        array_form: ['MA-062 original team form reaches existing blade formation'],
        array_exit: ['MA-063 both original members leave the formation and prior no_quit is restored',
            'MA-063 dissolution removes only this formation\'s original bonuses'],
        last_ammo: ['MA-120 original twice command completes without negative amount error',
            'MA-120 second launch is refused specifically because ammunition is exhausted'],
    };
    if (Object.hasOwn(reviewLabels, before)) {
        const prefix = before === 'fields' || before === 'npc_fixes' || before === 'combat_cost' ? before : 'state_cost';
        for (const label of reviewLabels[before]) {
            assert.ok(result.output.includes('FAIL: ' + prefix + ' ' + label),
                'Missing actual old behavior for ' + before + ': ' + label);
        }
        const traceParts = result.output.split('TEST TRACE:').slice(1);
        const traceErrors = traceParts.map(chunk => chunk.match(/^  "error" : "([^\r\n]+)/m)?.[1]);
        if (before === 'fields') {
            assert.deepEqual(traceErrors, Array(4).fill('*Bad argument 1 to EFUN call_other()'),
                'Only the four pinned cold-load failures are expected');
            for (const [index, skill] of ['dagou-bang', 'qiankun-jian', 'yiyang-zhi', 'chousui-zhang'].entries()) {
                assert.ok(traceParts[index].includes('"function" : "#global_init#"') &&
                    traceParts[index].includes('"program" : "/kungfu/skill/' + skill + '.c"') &&
                    result.output.includes('FAIL: fields MA-135 cold load ' + skill), 'Missing original cold-load trace: ' + skill);
            }
        } else if (before === 'last_ammo') {
            assert.deepEqual(traceErrors, ['*combine:set_amount less than 1.']);
            assert.ok(traceParts[0].includes('"program" : "/kungfu/skill/tanzhi-shentong/po.c"') &&
                traceParts[0].includes('"program" : "/inherit/item/combined.c"'), 'Missing original last-stone call chain');
        } else assert.deepEqual(traceErrors, [], 'Unexpected runtime error in ' + before);
        assert.ok(!result.output.split(/\r?\n/).some(line => line.startsWith('FAIL: *')) &&
            !diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line) &&
                !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
        'An aborted suite or compiler diagnostic is not old-behavior evidence');
    }
    if (stateGroups.includes(before) || before === 'shenghuo') {
        assert.ok(result.output.includes('FAIL: ' + before + ' '), 'Missing specific state defect');
        assert.ok(!/\b(?:error|warning):/i.test(diagnostics.replaceAll("WARNING: Platform doesn't support eval limit!", '')),
            'Negative control must compile without diagnostics');
    }
    if (before === 'shenghuo') {
        assert.ok(result.output.includes('SHENGHUO can success=0 stop=0 outer=0 attacks=63 passive=7 wounds=0'),
            'Negative control must reproduce the seven times eight additional attacks');
        assert.ok(!result.output.includes('TEST TRACE:'), 'A fixture runtime failure is not a reproduced defect');
    }
    if (before === 'teaching') {
        for (const id of ['003', '008.03', '017', '019', '020', '023', '055', '067', '116', '117', '142'])
            assert.ok(result.output.includes('FAIL: teaching MA-' + id), 'Missing negative control MA-' + id);
        assert.ok(!result.output.includes('TEST TRACE:'), 'A fixture exception is not a reproduced teaching defect');
        assert.ok(!/\b(?:error|warning):/i.test(diagnostics.replaceAll("WARNING: Platform doesn't support eval limit!", '')),
            'Teaching negative control must compile without diagnostics');
    }
    if (before === 'recruitment') {
        for (const id of ['016', '018'])
            assert.ok(result.output.includes('FAIL: recruitment MA-' + id), 'Missing negative control MA-' + id);
        assert.ok(!result.output.includes('TEST TRACE:'), 'A fixture exception is not a reproduced recruitment defect');
    }
    if (before === 'closeout') {
        const failures = result.output.split(/\r?\n/).filter(line => line.startsWith('FAIL: '))
            .map(line => line.slice('FAIL: '.length));
        const namePrefix = 'fields MA-013/072/078 name follows original named action ';
        const ordinaryNames = [6, 6, 1, 8, 8, 8, 6, 4, 10, 6, 8, 8, 6];
        for (const [index, skill] of actionNameSkills.entries()) {
            const levels = failures.filter(line => line.startsWith(namePrefix + skill + ' '));
            assert.equal(new Set(levels).size, ordinaryNames[index], 'Expected original name failures: ' + skill);
            assert.equal(levels.length, ordinaryNames[index], 'Duplicate name failures: ' + skill);
        }
        const expected = [
            ...['tianluo-diwang', 'fireice-strike'].flatMap(skill => [
                'fields MA-011 original two-skill prepare order 0 works ' + skill,
                ...Array(2).fill('fields MA-011 adding meinv after palm works ' + skill),
            ]),
            'fields MA-072 last normal named action', 'fields MA-072 highest named action',
            'fields MA-088 projected move names the intended target and limb',
            'fields MA-102 mapped dodge has martial dodge message',
            'fields MA-114 legitimate personality receives original enhancement 国士无双',
            'fields MA-121 compares own song level',
            'fields MA-121 unrelated autumn song cannot block learning',
            'fields MA-126 first failed dodge description not overwritten by fallthrough',
            'npc_fixes MA-021 original winner callback selects age-appropriate praise 20',
            'npc_fixes MA-053 original refusal callback actually speaks its reason',
            'npc_fixes MA-053 original learn command routes the actual refusal without study cost or progress',
            'npc_fixes MA-065 researcher permission selects its intended difficulty',
            ...['qi', 'po'].flatMap(kind => [
                'npc_fixes MA-066 completed ' + kind + ' at 100 never awards completion twice',
                'npc_fixes MA-066 ' + kind + ' at 100 never repeats its first reward',
            ]),
            'state_cost MA-009 mixed instrument order creates the original bonus xiao+qin',
            'state_cost MA-009 two qin players cannot create a qin-xiao ensemble',
            'state_cost MA-081 output describes the new destination, not the old room',
        ];
        assert.deepEqual(failures.filter(line => !actionNameSkills.some(skill =>
            line.startsWith(namePrefix + skill + ' '))).sort(), expected.sort(),
        'Original controls must fail on the specified branches and preserve neighboring behavior');
        assert.ok(!result.output.includes('TEST TRACE:') && !diagnostics.split(/\r?\n/).some(line =>
            /\bwarning:|\berror:/i.test(line) && !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
        'Unexpected compiler/runtime exception in closeout');
    }
    if (before === 'design_fixes') {
        for (const id of ['004', '006', '031', '040', '044', '049', '057', '078', '091',
            '108/112', '113', '123', '129', '136'])
            assert.ok(result.output.includes('FAIL: design_fixes MA-' + id), 'Missing negative control MA-' + id);
        assert.ok(result.output.includes('MA-012 EFFECTIVE 130/100/140') &&
            !result.output.includes('FAIL: design_fixes MA-012'), 'Original action values must not change');
        assert.ok(!result.output.includes('TEST TRACE:') && !diagnostics.split(/\r?\n/).some(line =>
            /\bwarning:|\berror:/i.test(line) && !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
        'An old-source compiler/runtime exception is not a passing negative control');
    }
    if (before === 'room_home') {
        assert.ok(result.output.includes('FAIL: npc_fixes ROOM-HOME'),
            'Missing room home/startroom negative control');
        assert.ok(!result.output.includes('TEST TRACE:'),
            'A fixture exception is not a reproduced room ownership defect');
        assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
            && !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
            'Room ownership negative control must compile without diagnostics');
    }
    if (before === 'array_remove') {
        assert.ok(result.output.includes('FAIL: state_cost MA-063-REMOVE'),
            'Missing destruction cleanup negative control');
        assert.ok(!result.output.includes('TEST TRACE:'),
            'A fixture exception is not a reproduced formation lifecycle defect');
        assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
            && !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
            'Formation removal negative control must compile without diagnostics');
    }
    if (before === 'array_remove_order') {
        const expected = 'FAIL: state_cost MA-063-REMOVE rejection does not dismiss the active formation';
        assert.deepEqual(result.output.split(/\r?\n/).filter(line => line.startsWith('FAIL: ')),
            [expected, expected], 'Only refusal of removal of each member distinguished the previous ordering');
        assert.ok(!result.output.includes('TEST TRACE:') && !diagnostics.split(/\r?\n/).some(line =>
            /\bwarning:|\berror:/i.test(line) && !/^WARNING: Platform doesn't support eval limit!$/.test(line)),
        'The removal rejection test must not hide other errors');
    }
    if (['canhe_action', 'tanzhi_action'].includes(before)) {
        assert.equal(result.output.split('TEST TRACE:').length - 1, before === 'tanzhi_action' ? 3 : 2,
            'Only the expected cold-load/name/action exceptions may occur');
        assert.ok(result.output.includes('*Bad argument 1 to EFUN call_other()')
            && result.output.includes('*Value being indexed is zero.'),
            'Must reproduce both the missing player and subsequent zero indexing');
        assert.ok(result.output.includes('FAIL: ' + before + ' cold action table is usable'),
            'Must reproduce the broken action table after a playerless load');
        assert.ok(result.output.includes('FAIL: ' + before + ' current actor formula force'),
            'Must also reproduce the frozen loading-player attributes');
        assert.ok(!/\b(?:error|warning):/i.test(diagnostics.replaceAll("WARNING: Platform doesn't support eval limit!", '')),
            'Negative control must compile without diagnostics');
        assert.ok(result.output.split(/\r?\n/).filter(line => line.startsWith('FAIL: '))
            .every(line => line.startsWith('FAIL: ' + before + ' ')), 'Unexpected negative-control failure');
    }
    console.log('MARTIAL_AUDIT BEFORE ' + before + ': expected defect detected');
} else {
    assert.equal(result.code, 0, 'Driver failed; inspect ' + sandbox);
    assert.ok(result.output.includes('MARTIAL_AUDIT PASS'), 'Incomplete regression');
    assert.ok(!result.output.includes('TEST TRACE:'), 'Regression must not hide caught runtime exceptions');
    if (['canhe_action', 'tanzhi_action'].includes(group)) assert.ok(!result.output.includes('TEST TRACE:'),
        'Fixed action regression must have no caught runtime exceptions');
    assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:/i.test(line)
        && !/^WARNING: Platform doesn't support eval limit!$/.test(line)), 'Compiler diagnostics; inspect ' + sandbox);
}
