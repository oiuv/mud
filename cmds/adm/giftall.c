// giveall.c
#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg) {
    object ob, blueprint, leftover, item;
    object *existing;
    mixed err;
    int count, num;
    string target, str;
    object pob;
    mapping ips;
    string ip, *ks;

    if (!SECURITY_D->valid_grant(me, "(admin)"))
        return 0;

    if (!arg)
        return notify_fail("派礼物给在线玩家，同IP玩家随机选择一位。\n\n命令格式： giftall </路径/../目标文件名> <数量>\n\n");

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

    ips = ([]);
    foreach (pob in all_interactive()) {
        if (wizardp(pob) || !pob->query("born") ||
            !living(pob) || !environment(pob) ||
            pob->is_ghost())
            continue;

        ip = query_ip_number(pob);
        if (undefinedp(ips[ip]))
            ips[ip] = ({ pob });
        else
            ips[ip] += ({ pob });
    }

    if (sizeof(ips) >= 1) {
        ks = keys(ips);
        foreach (ip in ks) {
            pob = ips[ip][random(sizeof(ips[ip]))];
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

            err = catch(ob->move(pob));
            if (err || !objectp(ob) || environment(ob) != pob) {
                if (objectp(ob)) destruct(ob);
                write("礼物交付失败，停止后续派送。\n");
                break;
            }
            num++;

            tell_object(pob, HIW "\n\n忽然从极高极远的天空中极速降下一只浑身烈焰的" HIR "火凤" HIW "，周身闪耀七彩光芒。\n" NOR);
            tell_object(pob, HIC "它爪下似乎抓着什么东西，突然" HIR "火凤" HIC "松开脚爪，有个东西直向你掉落下来。\n" NOR);
            tell_object(pob, HIG "你猛一提气纵身一跃丈高将此物抓在手中，又潇洒的飘落地面。\n\n" NOR);
        }
        str = sprintf("共有%d位玩家得到了%s。\n\n", num, blueprint->query("name"));
        me->start_more(str);
        return 1;
    }
    return notify_fail("在线没有可以接受礼物的玩家。\n");
}

int help(object me) {
    write(@HELP
指令格式：giftall|gift <物品路径> <数量>

给在线的每一个IP的玩家一件礼物。
支持 .c、.lpc 和虚拟品种，例如：giftall /d/items/neck/baijin_quan
同一 IP 从原有合格玩家中随机选择一位，失败时报告实际已派送人数。
HELP
    );
    return 1;
}
