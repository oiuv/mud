// xiaoer2.c 酒店小二
#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
    set_name("店小二", ({ "xiao er", "xiao", "waiter" }) );
    set("nickname", HIC "消息灵通" NOR);
    set("gender", "男性" );
    set("age", 22);
    set("long",
        "这位店小二正笑咪咪地忙著，还不时拿起挂在脖子上的抹布擦脸。\n");
    set("combat_exp", 100);
    set("attitude", "friendly");
    set("rank_info/respect", "小二哥");
    set("vendor_goods", ({
        "/d/city/npc/obj/jitui",
        "/d/city/npc/obj/jiudai",
        "/d/city/npc/obj/baozi",
    }));
    setup();
    carry_object("/clone/misc/cloth")->wear();
}

void init()
{
    ::init();
    remove_call_out("greeting");
    call_out("greeting", 1, this_player());

    add_action("do_buy", "buy");
    add_action("do_list", "list");
}

void greeting(object ob)
{
    if (! ob || environment(ob) != environment())
                return;

    switch (random(2))
        {
        case 0:
            say("店小二笑咪咪地说道：这位" + RANK_D->query_respect(ob) +
                            "，进来喝杯茶，歇歇腿吧。\n");
            break;
        case 1:
            say("店小二用脖子上的毛巾抹了抹手，说道：这位" +
                            RANK_D->query_respect(ob) +
                        "，请进请进。\n");
            break;
    }
}
