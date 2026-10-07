// luohan-gun perform 罗汉棍阵

#include <ansi.h>

#define SHIBA HIY "【十八罗汉棍阵】" NOR

#define ME  "你现在不能使用" + SHIBA + "。\n"
#define TAR  "对方现在不能使用" + SHIBA + "。\n"

int check_fight(object me, object target, mapping effect);
private int remove_effect(object me, object target, mapping effect);

int perform(object me, object target) {
    object *enemy;
    int i, j, k, amount;
    object wep1, wep2;
    mapping effect;
    wep1 = me->query_temp("weapon");

    if (!target || target == me) return notify_fail("你要和谁组成棍阵?\n");

    if (me->query_temp("gunzhen")) return notify_fail(ME);
    if (target->query_temp("gunzhen")) return notify_fail(TAR);
    if (me->query("jingli") < 200) return notify_fail(ME);
    if (target->query("jingli") < 200) return notify_fail(TAR);
    if (me->query("neili") < 1500) return notify_fail(ME);
    if (target->query("neili") < 1500) return notify_fail(TAR);
    if (!me->is_fighting()) return notify_fail(SHIBA "只能在战斗中使用。\n");
    if (me->is_fighting(target)) return notify_fail("你已经在和对方打架，使用" + SHIBA + "作什么?\n");
    if ((int)me->query_skill("luohan-gun", 1) < 120) return notify_fail(ME);
    if ((int)me->query_skill("club", 1) < 120) return notify_fail(ME);
    if (!wep1 || wep1->query("skill_type") != "club"
        || me->query_skill_mapped("club") != "luohan-gun")
        return notify_fail(ME);

    enemy = me->query_enemy();
    k = sizeof(enemy);
    while (k--)
        if (target->is_fighting(enemy[k])) break;
    if (k < 0) return notify_fail(target->name() + "并没有和你的对手在交战。\n");

    if ((int)target->query_skill("luohan-gun", 1) < 120)
        return notify_fail(TAR);
    if ((int)target->query_skill("club", 1) < 120)
        return notify_fail(TAR);
    wep2 = target->query_temp("weapon");
    if (target->is_busy() || !wep2 || wep2->query("skill_type") != "club"
        || target->query_skill_mapped("club") != "luohan-gun")
        return notify_fail(TAR);


    message_vision(HIY "\n只见他们几人，动作协调，阵行严谨，攻守一体，" +
        "一招一式，都似发自同一人，威力大增。" +
        "$n不由看的呆了......\n" NOR, me, target);
    // receive_damage only accepts qi/jing; these are formation resource costs.
    me->add("jingli", -100);
    target->add("jingli", -100);
    me->add("neili", -300);
    target->add("neili", -300);
    me->start_busy(1);
    target->start_busy(1);
    i = (int)me->query_skill("luohan-gun", 1);
    j = (int)target->query_skill("luohan-gun", 1);
    amount = ((i + j) / 10 + (int)me->query_str() + (int)target->query_str()) / 5;
    if (amount > 20) amount = 20;
    // Shared identity prevents a stale check from removing a later formation.
    effect = ([ "amount": amount ]);
    me->set_temp("gunzhen", effect);
    target->set_temp("gunzhen", effect);
    me->add_temp("apply/dex", amount);
    me->add_temp("apply/str", amount);
    target->add_temp("apply/dex", amount);
    target->add_temp("apply/str", amount);
    enemy[k]->start_busy(amount / 3);
    check_fight(me, target, effect);
    return 1;
}

int check_fight(object me, object target, mapping effect) {
    object wep1, wep2;

    if (!mapp(effect)) return 0;
    if (!me || !target || me->query_temp("gunzhen") != effect ||
        target->query_temp("gunzhen") != effect)
        return remove_effect(me, target, effect);
    wep1 = me->query_temp("weapon");
    wep2 = target->query_temp("weapon");
    if (!me->is_fighting()
        || !living(me)
        || me->is_ghost()
        || !wep1
        || wep1->query("skill_type") != "club"
        || !target->is_fighting()
        || !living(target)
        || target->is_ghost()
        || !wep2
        || wep2->query("skill_type") != "club"
        || me->query_skill_mapped("club") != "luohan-gun"
        || target->query_skill_mapped("club") != "luohan-gun"
        || environment(me) != environment(target))
        remove_effect(me, target, effect);
    else {
        call_out("check_fight", 1, me, target, effect);
    }
    return 1;
}

private int remove_effect(object me, object target, mapping effect) {
    object member;
    int amount;

    if (objectp(me) && objectp(target)
        && me->query_temp("gunzhen") == effect
        && target->query_temp("gunzhen") == effect
        && living(me)
        && !me->is_ghost()
        && living(target)
        && !target->is_ghost())
        message_vision(HIY "\n各僧众将阵法施展完毕，各自收招。\n" NOR, me, target);

    amount = effect["amount"];
    foreach (member in ({ me, target })) {
        if (!objectp(member) || member->query_temp("gunzhen") != effect)
            continue;
        member->add_temp("apply/dex", -amount);
        member->add_temp("apply/str", -amount);
        member->delete_temp("gunzhen");
    }
    return 0;
}
