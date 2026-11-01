// Assertions shared by the finite, source-reviewed teaching collections.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export const readTeaching43Source=path=>readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
export function assertTeaching43Contract(condition,canonical){
    assert.ok(canonical,'unknown source-reviewed condition');
    assert.ok(condition.samples===1||condition.samples===canonical.samples,'only independent smoke may reduce sample count');
    assert.deepEqual({...condition,samples:canonical.samples},canonical,
        'condition metadata/qualification/teacher/evidence must match the source-reviewed factory exactly');
}
export function assertTeaching43Counters(metrics,expected={}){
    assert.ok(metrics&&typeof metrics==='object'&&!Array.isArray(metrics),'actual resource counters must be a mapping');
    for(const [key,value]of Object.entries(metrics)){
        assert.ok(Number.isSafeInteger(value)&&value>=0,'invalid actual counter: '+key);
        assert.equal(value,expected[key]??0,'unexpected resource or gameplay event counter: '+key);
    }
    for(const [key,value]of Object.entries(expected))assert.equal(Object.hasOwn(metrics,key)?metrics[key]:0,value,'missing actual counter: '+key);
}
export function assertTeaching43Snapshots(raw,before,after,condition){
    const input=condition.parameters.actor.properties;
    for(const [which,point]of [['before',before],['after',after]]){
        const state=raw[which]?.[0];assert.ok(state&&typeof state==='object'&&!Array.isArray(state));
        for(const key of ['userp','playerp','interactive','living'])assert.equal(state[key],1,'real connected living student: '+key);
        for(const key of ['wizardp','ghost'])assert.equal(state[key],0,'ordinary nonwizard student: '+key);
        assert.equal(state.object,point.object??raw.teaching[0].student);
        for(const key of ['qi','eff_qi','max_qi','eff_jing','max_jing','gender'])
            if(Object.hasOwn(input,key))assert.equal(state[key],input[key],'unchanged input state: '+which+'/'+key);
        for(const key of ['skills','learned','mappings','jing','neili','max_neili','max_jingli','str','con','dex','int','combat_exp','potential','learned_points','shen']){
            // Base snapshot preserves an absent dbase field as JSON null;
            // teaching_state intentionally normalizes only this optional field to0.
            if(key==='max_jingli'&&state[key]===null&&!Object.hasOwn(condition.parameters.actor.properties,key))assert.equal(point[key],0);
            else assert.deepEqual(state[key],point[key],'outer/teaching point mismatch: '+which+'/'+key);
            if(!['skills','learned','mappings'].includes(key))assert.ok(Number.isSafeInteger(point[key]),'actual integer state: '+key);
        }
    }
    for(const key of ['attacks','launches','interfaces','callbacks','passives','defenses','dodge_checks','terminals'])assert.deepEqual(raw[key],[],'noncombat teaching must not include extra gameplay: '+key);
    assert.equal(raw.metrics.length,raw.before.length,'one counter mapping for each actual participant');
    for(const metrics of raw.metrics.slice(1))assertTeaching43Counters(metrics);
    if(raw.before.length>1||raw.after.length>1)assert.deepEqual(raw.after.slice(1),raw.before.slice(1),'other connected participants must remain unchanged');
}
