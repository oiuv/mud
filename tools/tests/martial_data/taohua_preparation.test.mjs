import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';

// Preparation contracts only. This test neither registers these groups nor
// launches a driver, and no synthetic sample is written to a real series.
const root = realpathSync(fileURLToPath(new URL('../../../', import.meta.url)));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const groups = [
    ['ding', 22, 730, 44, '0fc7550bd2d034e5557e9eaba77d1d7e87de9e3c6baaedfd53363b8246950c11', '60b1984b8a1c996afb99ee0d7594b3a0b9b4aa23e88df5f2ff06e26cb5cdf624'],
    ['xiao', 17, 720, 34, 'e6852c55078ec1899c9981b3f259d6f2633e8f5d668ea4fb298cc3e37bd2539d', 'fb35782bfa6fbeb886ddf1918d2db2555a63133a1d4205fd73630ac5d54590e4'],
    ['po', 19, 822, 27, 'ee880690ba7e83ae10650a077f15024ab3376418fdbf1cc46e0b5584d0fba436', '8d7498c44125df052c37d4cffb57b8766fbd973a27a936137ed8f31e5285a21e'],
    ['zhuan', 24, 734, 24, 'ab3a00d43bb600e330e34087f6c6a16dfd593856cb4f9139111da0d7c6cd0232', 'edc59573f318597bf2d60829614771529017ccf9d2ee030bfa285d639b7586b7'],
    ['direct', 41, 1650, 41, '8014b5cd664eb8ebf146106533b2913e190b5c3347092e4dd924be8073d394b0', '7d13af9641c8fd82953e97df131662b1e24038e8d41dbf943d89eb6be6f95942'],
    ['control', 27, 1034, 54, '4ca1afa364c2b385615aaaeae13016b5da2c945efafc59972f6f8b7cd8896b6f', '1d6d039c4af6eee41187809511f35d21822395d8ef0e896c9db365a514cea81b'],
    ['npc', 52, 1476, 52, '9ee4e16d6e3b52f3bd4f1d81d80f0961d0f595c4fb9351b2aeac1f2fbe8976e1', 'e7ce42d788679e079a0f585b709fbf8d903f4ab2a23eadfc3bddb47f81d5e72c'],
    ['attack', 25, 2108, 25, 'dab363b293a8da013c5d948872d2e21efc7ddb2d4b2fe489c56b20a16b8acc5f', '5bf0d38e682b40a71f223ba3ba1061df671e6f4fbee7418f39d1498322e61fad'],
    ['combo', 24, 1420, 48, 'c2232aaf06dc8b3bdc49ab1071d98e1d92ef59587e5c5a87f5e6868c413d595c', 'a34becd237a5cb3a99459e924d391b241bda13777a8e42b4465d574005b0412a'],
    ['bihai', 23, 732, 46, 'd5046d8c95e6a655fccfb0b00c310515e5c192ea77cf9e5f2de9151a5e8b5794', 'f90cc6ab9c72930625e7e814a34e381ffa4fbea7e9b15483cf493f60a8d9b3be'],
    ['passive', 16, 1110, 16, '1c34e98de633e6777e87df2a565ca6088ca0dbc0591e20a471051e490b289f0a', 'ca8207fd1539745c1e34f39f78854bd668211486bfcd3aa457fcb0afc4f2eb0b'],
    ['combination', 12, 808, 12, 'dfa064bd9999cdae5b510d91e946df7bd0631c56c5bbcda939cf41ba696b4724', 'cd0d3755a3c77d18591a9098ae5812053f2445dd95e9fe61ee369780501613df'],
    ['force', 29, 352, 58, '1a968d245494a522ef94c4bf5f0716e18ee080ca51b69ada629dc9e43c5ed685', 'd1f5018b8474a42d21bd7e55f9f731e6681598ab70952b4f9832175a6fbd188c'],
    ['learning', 187, 3608, 187, '57fba754e43df825247babf08e7847169e6ea7aa6fe437480e8f663c07975894', '64ef2b69bcd53c0652c2073251e9db5f4a97df4b25eacacabb2881de9aab9daa'],
    ['music', 30, 648, 30, 'c7d9836b34f9a8c572b195ed22802805c0180d6c3190c627c0303427d31c1c58', 'ea368725ff48718946a5b98bbe1bd90e7fde72de770d11bfe6cc5c5d1ffc79a2'],
];
const count = cases => cases.reduce((sum, c) => sum + c.samples, 0);
const sources = new Map(), prepared = [];
const read = path => {
    const actual = realpathSync(resolve(root, path));
    const inside = relative(root, actual).replaceAll('\\', '/');
    assert.ok(inside && !inside.startsWith('../') && !/^[A-Z]:/i.test(inside), '仓库边界');
    assert.ok(!/^(?:u|backup|log|ai|data)\//.test(inside) || inside === 'data/e2c_dict.o', '只读公开来源');
    const bytes = readFileSync(actual);
    sources.set(inside, sha256(bytes));
    return bytes.toString('utf8');
};
for (const [group] of groups) {
    const module = await import('./school_taohua_' + group + '_cases.mjs');
    const factories = Object.entries(module).filter(([name]) => name.endsWith('Conditions'));
    assert.equal(factories.length, 1, group);
    // These are existing distinct APIs, not a new runtime adapter. Xiao/Po/
    // Zhuan take options second; learning takes relations then catalog.
    const args = group === 'learning' ? [relations, catalog, read]
        : ['xiao', 'po', 'zhuan'].includes(group) ? [catalog] : [catalog, read];
    for (const [name, paths] of Object.entries(module))
        if (name.endsWith('SourcePaths')) for (const path of paths) read(path);
    prepared.push({ group, formal: factories[0][1](...args, { smoke: false }),
        smoke: factories[0][1](...args, { smoke: true }) });
}

test('十五组当前完整有序矩阵：548条件/17952正式计划/698烟雾计划，不计实际完成', () => {
    for (const [group, conditions, formal, smoke, formalHash, smokeHash] of groups) {
        const current = prepared.find(p => p.group === group);
        assert.equal(current.formal.length, conditions, group);
        assert.equal(current.smoke.length, conditions, group);
        assert.equal(count(current.formal), formal, group);
        assert.equal(count(current.smoke), smoke, group);
        assert.equal(sha256(JSON.stringify(current.formal)), formalHash, group);
        assert.equal(sha256(JSON.stringify(current.smoke)), smokeHash, group);
    }
    assert.equal(prepared.reduce((n, p) => n + p.formal.length, 0), 548);
    assert.equal(prepared.reduce((n, p) => n + count(p.formal), 0), 17952);
    assert.equal(prepared.reduce((n, p) => n + count(p.smoke), 0), 698);
});

test('烟雾仅减少同一固定条件次数，不把不同工厂签名误当通用调用', () => {
    const withoutSamples = cases => cases.map(({ samples, ...rest }) => rest);
    for (const p of prepared) {
        assert.deepEqual(withoutSamples(p.smoke), withoutSamples(p.formal), p.group);
        assert.ok(p.smoke.every((c, i) => c.samples <= p.formal[i].samples), p.group);
    }
});

test('来源只读边界与读取后摘要保持；不同独立组无重复规范条件ID', () => {
    assert.ok(sources.size > 0);
    for (const [path, hash] of sources) assert.equal(sha256(readFileSync(join(root, path))), hash, path);
    const ids = prepared.flatMap(p => p.formal.map(c => c.id));
    assert.equal(new Set(ids).size, ids.length);
});
