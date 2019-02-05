#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
        set_name("店小二", ({ "xiao er", "xiao", "er" }) );
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性" );
        set("age", 22);
        set("long",
                "一个笑眯眯的店小二，是全聚德中的伙计。\n");
        set("combat_exp", 100);
        set("attitude", "friendly");
        set("rank_info/respect", "小二哥");
        set("vendor_goods", ({
                "/d/city/obj/jitui",
                "/d/city/obj/jiudai",
                "/d/city/obj/baozi",
                "/d/beijing/obj/mian",
        }));
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");

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
                say( CYN "店小二笑咪咪地说道：这位" + RANK_D->query_respect(ob)
                   + CYN + "，欢迎来到全聚德酒楼。\n" NOR);
                break;
        case 1:
                say( CYN "店小二用脖子上的毛巾抹了抹手，说道：这位" + RANK_D->query_respect(ob)
                   + CYN + "，快请进，来吃全聚德的烤鸭吗？\n" NOR);
                break;
        }
}
