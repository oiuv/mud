// giveall.c
#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg) {
    object ob, blueprint, player, leftover, item;
    object *existing;
    mixed err;
    int count, num = 0;
    string target, str;

    if (!SECURITY_D->valid_grant(me, "(admin)"))
        return 0;

    if (!arg)
        return notify_fail("派送礼物给经验超过5万的在线玩家。\n\n"
            "命令格式： giveall </路径/目标文件名> [数量]\n\n");

    if (sscanf(arg, "%s %d", target, count) != 2)
        target = arg;

    seteuid(getuid());
    target = resolve_path(me->query("cwd"), target);
    if (lpc_object_path(target) != target && !lpc_file(target))
        return notify_fail("指定的源码文件不存在，尚未派送。\n");
    target = lpc_file(target) || target;
    err = catch(blueprint = load_object(target));
    if (err || !objectp(blueprint))
        return notify_fail("路径不正确或礼物无法加载，尚未派送。\n");

    foreach (player in users()) {
        if (player->query("combat_exp") <= 50000) continue;
        existing = children(target);
        err = catch(ob = new(target));
        if (err || !objectp(ob)) {
            foreach (leftover in children(target) - existing) {
                if (!objectp(leftover) || !clonep(leftover)) continue;
                foreach (item in deep_inventory(leftover)) if (objectp(item)) destruct(item);
                destruct(leftover);
            }
            write("礼物创建失败，停止后续派送。\n");
            break;
        }

        if (count > 1 && ob->query("base_unit"))
            ob->set_amount(count);
        err = catch(ob->move(player));
        if (err || !objectp(ob) || environment(ob) != player) {
            if (objectp(ob)) destruct(ob);
            write("礼物交付失败，停止后续派送。\n");
            break;
        }
        num++;
        tell_object(player, HIW "\n\n忽然从极高极远的天空中极速降下一只浑身烈焰的" HIR "火凤" HIW "，周身闪耀七彩光芒。\n" NOR);
        tell_object(player, HIC "它爪下似乎抓着什么东西，突然" HIR "火凤" HIC "松开脚爪，有个东西直向你掉落下来。\n" NOR);
        tell_object(player, HIG "你猛一提气纵身一跃丈高将此物抓在手中，又潇洒的飘落地面。\n\n" NOR);
    }
    str = sprintf("共有 %d 位玩家得到了%s。\n\n", num, blueprint->query("name"));
    me->start_more(str);
    return 1;
}

int help(object me) {
    write(@HELP
指令格式：giveall 礼品路径 [数量]

给经验超过五万的在线玩家发放礼品，数量沿用可合并物品的规则。
支持 .c、.lpc 和虚拟品种，例如：giveall /d/items/neck/baijin_quan
HELP
    );
    return 1;
}
