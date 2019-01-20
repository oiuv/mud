#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + WHT "布阵箱" NOR, ({ "buzhen xiang", "buzhen", "xiang" }));
        set_weight(4000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一个颇为陈旧的墨漆木箱，箱中"
                            "装有各种各样\n的道具，大非寻常。可以用来布"
                            "阵(" HIW "array" NOR + WHT ")惑敌。\n" NOR);
                set("unit", "个");
                set("value", 5000);
                set("no_sell", "嘿，这破箱子也能卖钱？\n");
                set("count", 5);
                set("material", "wood");
        }
        setup();
}

void init()
{
        add_action("do_array", "array");
        add_action("do_array", "buzhen");
}

int do_array(string arg)
{
        object me, env/*, *ob*/;
        string desc;
        int skill;
        mapping exit;

        me = this_player();

        if (me->is_busy()
           || me->query_temp("pending/exercising")
           || me->query_temp("exit_blocked"))
                return notify_fail("你现在正忙着呢。\n");

        env = environment(me);
        exit = env->query("exits");

        skill = (int)me->query_skill("qimen-wuxing", 1);

        if (skill < 1)
                return notify_fail("你把布阵箱翻来覆去摆弄了半天，却"
                                   "不知如何下手。\n");

        if (query("count") < 1)
                return notify_fail("布阵箱中的物件已经用完了。\n");

        if (skill < 120)
                return notify_fail("你对奇门五行的研究不够，尚且无法"
                                   "布阵。\n");

        if (! env)
                return notify_fail("这里无法布阵。\n");

        if (wiz_level(me) < 3
           && (env->query("no_fight")
           || env->query("sleep_room")
           || env->query("skybook")
           || env->query("no_sleep_room")))
                return notify_fail("这里不是你嚣张的地方。\n");

        if (wiz_level(me) < 3 && ! env->query("outdoors"))
                return notify_fail("室内空间过于狭小，难以布阵。\n");

        if (env->query("th_buzhen"))
                return notify_fail("这里已经布有奇门阵法。\n");

        if (me->query("max_jingli") < 800)
                return notify_fail("你的精力修为不足，难以布阵。\n");

        if (me->query("jingli") < 500)
                return notify_fail("你目前的精力不足，难以布阵。\n");

        if (me->query("jing") < 300)
                return notify_fail("你目前的精气不足，难以布阵。\n");

        add("count", -1);
        me->receive_damage("jing", 200);
        me->add("jingli", -300);
        me->start_busy(5);

        message_sort(HIG "\n$N" HIG "微微一笑，蓦地摆出" NOR + WHT "布阵箱"
                     HIG "，随后身形急转，飘舞不定，在四周迅速布下奇门阵法"
                     "。霎时烟尘四起，砂石乱飞，声势煞为惊人。不一刻，又见"
                     "$N" HIG "收势凝形负手而立，四下里从寂静中隐隐透出一股"
                     "肃杀之气。\n\n" NOR, me);

        desc = env->query("long") + HIM "\n却见此处景况非常诡异，紫色雾气弥"
               "漫于空中，透出森森鬼气。\n\n" NOR;

        env->set("org_desc", env->query("long"));
        env->set("org_exits", env->query("exits"));
        env->set("org_cost", env->query("cost"));
        env->set("long", desc);
        env->set("th_buzhen", 1);
        env->set("th_zhen_owner", me->query("id"));
        env->set("th_pozhen", skill);

        if (skill < 150)
        {
                env->set("exits", ([
                        "east"  : file_name(env),
                        "south" : file_name(env), 
                        "west"  : file_name(env),
                        "north" : file_name(env),
                ]));
        } else
        if (skill < 180)
        {
                env->set("exits", ([
                        "east"  : file_name(env),
                        "south" : file_name(env),
                        "west"  : file_name(env),
                        "north" : file_name(env),
                        "northwest" : file_name(env),
                        "northeast" : file_name(env),
                        "southeast" : file_name(env),
                        "southwest" : file_name(env),
                ]));
        } else
        {
                env->set("exits", ([
                        "east"  : file_name(env),
                        "south" : file_name(env),
                        "west"  : file_name(env),
                        "north" : file_name(env),
                        "enter" : file_name(env),
                        "out"   : file_name(env),
                        "up"    : file_name(env),
                        "down"  : file_name(env),
                        "northwest" : file_name(env),
                        "northeast" : file_name(env),
                        "southeast" : file_name(env),
                        "southwest" : file_name(env),
                ]));
        }
        call_out("remove_effect", skill / 2, env);
        return 1;
}

void remove_effect(object env)
{
        if (! env || ! env->query("th_buzhen"))
                return;

        env->set("long", env->query("org_desc"));
        env->set("exits", env->query("org_exits"));
        env->set("cost", env->query("org_cost"));
        env->delete("org_desc");
        env->delete("org_cost");
        env->delete("org_exits");
        env->delete("th_buzhen");
        env->delete("th_pozhen");
        env->delete("th_zhen_owner");

        tell_object(env, HIM "\n突然间紫雾朝周围散去，四面景致"
                         "猛然一变。\n\n" NOR);
}