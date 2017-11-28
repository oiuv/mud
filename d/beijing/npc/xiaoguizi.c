#include <ansi.h> 

inherit NPC;

void create()
{
        set_name("小桂子", ({ "xiao guizi", "xiao", "guizi" }) );
        set("gender", "无性" );
        set("age", 13);
        set("long",
                "这位小太监在一旁小心侍侯着，手里拿着一包药。\n");
        set("combat_exp", 1000);
        set_skill("unarmed", 20);
        set_skill("parry", 20);
        set_skill("dodge", 20);
        
        set_temp("apply/attack", 5);
        set_temp("apply/defense", 5);
        set_temp("apply/damage", 5);

        set("attitude", "friendly");
        set("rank_info/respect", "小公公");
        setup();
        set("chat_chance", 5);
        set("chat_msg", ({
                CYN "小桂子说道：公公，再服一剂药，好不好？\n" NOR,
                CYN "小桂子道: 再服半剂，多半不打紧。\n" NOR,
        }) );
        carry_object(__DIR__"obj/cloth")->wear();
        carry_object("/d/city/obj/yaofen");
        add_money("silver",10);
}


