// giftbox.c 礼品盒
#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIR"礼品盒"NOR, ({ "giftbox", "box" }));
        set_weight(500);
        set_max_encumbrance(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "盒");
                set("long", "一盒礼品盒，盒里装着新年贺礼。\n\n    "HIR"新年快乐！！\n\n"NOR);
                set("value", 0);
        }
}

int is_container() { return 1; }

