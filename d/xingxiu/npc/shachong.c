#include <ansi.h>
inherit NPC;

void create()
{
        set_name("沙虫", ({ "sha chong", "chong", "bug" }) );
        set("race", "野兽");
        set("age", 3);
        set("long", "一只黄褐色的小甲虫，尾巴上有黄蓝相\n"
                    "间的环纹。你的直觉告诉你它一定有毒。\n");
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "身体", "触角", "前螯", "尾巴" }) );
        set("verbs", ({ "bite", "claw" }) );

        set("combat_exp", 300);
        set_temp("apply/attack", 5);
        set_temp("apply/defense", 2);
        set_temp("apply/armor", 1);
        setup();
}

void die()
{
        object ob;
        message_vision(HIG "$N" HIG "冒出一股绿水，死了。\n" NOR, this_object());
        ob = new(__DIR__"shachongke");
        ob->move(environment(this_object()));
        destruct(this_object());
}

