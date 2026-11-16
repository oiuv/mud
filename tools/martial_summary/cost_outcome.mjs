// Called only after the frozen 5.3 verification gate. This classifies results,
// not correctness: costs alone never establish a miss or a backlash.
export function cost_outcome(entry, data) {
    const before = data.before?.[0] ?? {};
    const actor = data.after?.[0] ?? {};
    const targetBefore = data.before?.[1] ?? {};
    const target = data.after?.[1] ?? {};
    const metrics = data.metrics?.[1] ?? {};
    const recovery = ['qi_recovery', 'eff_qi_recovery', 'jing_recovery', 'eff_jing_recovery']
        .some(k => metrics[k] > 0);
    const damage = ['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost'].some(k => metrics[k] > 0);
    const control = typeof target.busy === 'number' && target.busy > (targetBefore.busy ?? 0);
    if (recovery || damage || control) return 'normal';
    // tao.c:67-75,108-115: the reflected flame schedules unconsciousness.
    if (entry === 'kungfu/skill/chousui-zhang/tao.c:9:perform'
        && before.living === 1 && actor.living === 0 && actor.qi <= 0) return 'backlash';
    // surge-force/roar.c:34-48: resistance, die_guard or nonpositive damage
    // can leave the target unaffected; qi -10 is paid unconditionally (L23).
    if (entry === 'kungfu/skill/surge-force/roar.c:7:exert') return 'miss';
    if ((data.attacks ?? []).length > 0) return 'miss';
    return 'normal'; // already-verified non-damage effect (buff, move, dispel, etc.)
}
