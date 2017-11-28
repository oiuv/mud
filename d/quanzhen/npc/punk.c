#include <ansi.h>
inherit NPC;

void create()
{
        set_name("小流氓", ({ "xiao liumang", "xiao", "liumang" }));
        set("gender", "男性" );
        set("age", 18);
        set("long", "这是一个游手好闲的小流氓。\n");
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set("combat_exp", 500);
        set("shen_type", -1);
        set("str", 25);
        set("dex", 20);
        set("con", 18);
        set("int", 15);
        set("attitude","heroism");
        setup();

        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "流氓骂道：真他妈的邪，老子手里一对天牌，王小二这杂种居然\n"
                "就摸出一对至尊来。\n" NOR,

                CYN "流氓摸了摸自己的口袋，叹了口气说道：唉，钱都让王小二骗去\n"
                "了，不能去找翠花了。\n" NOR,

                CYN "流氓嘴角露出一丝邪笑，说道：翠花这娘们真她奶奶的够劲儿！\n" NOR,
        }));
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("silver", 5);
}
