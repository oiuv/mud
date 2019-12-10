#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
        set_name("陈老头", ({ "chen laotou", "chen", "laotou" }) );
         set("title", "客店老板");
         set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性" );
        set("age", 32);
        set("long",
              "一个年过六旬的小老头，他就是这家小客店的老板。\n");
        set("shen_type", 1);
        set("combat_exp", 3000);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
        set("attitude", "peaceful");
        set_skill("dodge",10);
        set_skill("unarmed",10);
        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "陈老头一边哼着小调一边拿着抹布打整卫生。\n" NOR,
                CYN "陈老头一个人嘀咕道：桌子也该换得了。\n" NOR,
        }) );

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("silver", 20);
}

void init()
{
        object ob;

        ::init();
        if ( interactive(ob = this_player()) && !is_fighting() )
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if ( ! ob || environment(ob) != environment() ) return;
        switch( random(2) )
        {
        case 0:
                say( CYN "陈老头苦笑着对你说道：这位" + RANK_D->query_respect(ob)
                   + CYN + "，真是对不住，小店已经客满了。\n" NOR);
                break;
        case 1:
                say( CYN "陈老头用脖子上的毛巾抹了抹手，无奈的说道：这位" + RANK_D->query_respect(ob)
                   + CYN + "，真不巧，小店已经客满了。\n" NOR);
                break;
        }
}
