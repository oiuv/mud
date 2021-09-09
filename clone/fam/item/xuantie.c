/*
 * @Author: 雪风@mud.ren
 * @Date: 2021-09-09 19:23:48
 * @LastEditTime: 2021-09-09 19:23:49
 * @LastEditors: 雪风
 * @Description: 天山玄铁，可打造多数装备
 *  https://bbs.mud.ren
 */
#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(NOR + CYN "天山玄铁" NOR, ({"tianshan xuantie", "tianshan", "xuantie"}));
    set_weight(20000);
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", NOR + CYN "世间极为罕见的玄铁，采自天山，着手极为沉重。\n" NOR);
        set("unit", "块");
        set("value", 30000);
        set("item_origin", 1);
        set("material_attrib", "stone");
        set("material_name", NOR + CYN "天山玄铁" NOR);
        set("can_make", "all");
        set("not_make", ({"战衣", "腰带", "护腕", "靴子"}));
        set("power_point", 100);
    }
}

int query_autoload()
{
    return 1;
}
