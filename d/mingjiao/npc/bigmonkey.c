#include <ansi.h>
inherit QUARRY;

void create()
{
        set_name(NOR + WHT "白猿" NOR, ({ "bai yuan", "bai", "yuan" }));
        set("long", WHT @LONG
这是一只大白猿，奇怪的是从它身上能够闻到
阵阵腐臭之气，原来白猿肚上脓血模糊，生著
一个大疮。模样甚是可怜，如果有能力，倒是
可以将它医治(heal)一番。
LONG NOR);
        set("no_auto_kill", 1);

        set("age", 65);
        set("str", 22);
        set("dex", 30);
        set("max_qi", 2500);
        set("max_jing", 2500);
        set("combat_exp", 300000);

        set("power", 50);
        set("bag_count", 1);

        set_temp("apply/parry", 200);
        set_temp("apply/dodge", 200);
        set_temp("apply/attack", 180);
        set_temp("apply/defense", 180);
        set_temp("apply/unarmed_damage", 220);
        set_temp("apply/armor", 220);

        setup();

        if (random(3) == 1)
                set_temp("handing", carry_object("/d/emei/obj/pantao"));
}

void init()
{
	add_action("do_lifeheal", "heal");
}

int do_lifeheal(string arg)
{
        object weapon, bag;
        object me = this_player();

        if (arg != "bai yuan" && arg != "bai" && arg != "yuan")
        {
            	write("你要干什么？\n");
            	return 1;
        }

        if (query("bag_count") < 1)
        {
        	write("大白猿一把跳开，不想让你医治。\n");
        	return 1;
        }

        if (me->query_skill("medical", 1) < 100)
        {
     	       write("你连基本医术都没学好，还谈什么医治。\n");
               return 1;
        }

        if (! present("fish bone", me))
        {
     	       write("你手中医疗器具不够，无法医治。\n");
               return 1;
        }

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade"
           && (string)weapon->query("skill_type") != "dagger"))
                return notify_fail("你还是找个锋利点的武器装"
                                   "上后再来开刀吧。\n");

        message_sort(HIC "\n$N" HIC "割开右边及上端的缝"
                     "线，再斜角切开早已联结的腹皮，只见"
                     "它肚子里竟藏著一个油布包裹。$N" HIC
                     "将油布包放在一边，以鱼骨做针，在它"
                     "腹皮上刺下一个个小孔，再将树皮撕成"
                     "细丝，穿过小孔打结，勉强将白猿的腹"
                     "肌缝好，在创口敷上草药。\n" NOR, me);

        GIFT_D->delay_gift_bonus(me, ([ "temp"    : "can_learn/jiuyang-shengong/kunlun",
                                        "prompt"  : "你通过医治白猿的经历",
                                        "exp"     : random(3000) + 2000,
                                        "pot"     : random(500) + 500,
                                        "score"   : random(100) + 100, ]));

        if (present("pan tao", this_object()))
        {
                message_vision(CYN "\n白猿吱吱吱叫了两声，从身"
                               "后摸出个水灵灵的大蟠桃，又嗅了"
                               "嗅。\n" NOR, this_object());

                command("give pan tao to " + me->query("id"));
        }

        add("bag_count", -1);
        bag = new("/d/mingjiao/obj/bag");
        bag->move(environment(me));

        return 1;
}

void unconcious()
{
        this_object()->die();
}

