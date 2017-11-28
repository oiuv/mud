#include <ansi.h> 
inherit ITEM;

void create()
{
        set_name(NOR + CYN "「毒经上篇」" NOR, ({ "du jing1", "jing1", "book1" }));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", CYN "这是一本薄薄的小册，上面密密麻麻的写满了各种用毒\n"
                            "的基本方法和毒药的配方。你可以用读(read)一读。\n" NOR);
                set("value", 100);
                set("no_sell", "我…我的天…连五毒教的东西你都敢拿来卖？");
                set("material", "silk");
                set("skill", ([
                        "name"         : "poison",
                        "exp_required" : 500,
                        "jing_cost"    : 20,
                        "difficulty"   : 20,
                        "max_skill"    : 49,
                ]));
        }
}

void init()
{
        add_action("do_read", "read");
}

int do_read(string arg)
{
        if (arg == "jing1" || arg == "book1")
                return notify_fail(NOR + CYN "\n"
"                                ┏┓\n"
"┏━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┓\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃         配       方          ┃┃       密   药   配   方      ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃ 赤蝎粉：断肠草、蛇信子、毒囊 ┃┃  五圣散：分取断肠散、腐肉膏  ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃ 孔雀胆：腐骨草、千日醉、毒囊 ┃┃  鹤顶红、孔雀胆、赤蝎粉各一  ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃ 鹤顶红：蛇信子、千日醉、毒囊 ┃┃  份，外加金蛇毒液调制，即可  ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃ 断肠散：断肠草、穿心莲、毒囊 ┃┃  炼成而成。如将密药配法外泄  ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┃┃                              ┃\n"
"┃ 腐肉膏：腐骨草、穿心莲、毒囊 ┃┃  者当杀无赦。                ┃\n"
"┃                              ┃┃                              ┃\n"
"┃                              ┣┫                              ┃\n"
"┗━━━━━━━━━━━━━━━┛┗━━━━━━━━━━━━━━━┛\n"
"\n\n" NOR);
}

