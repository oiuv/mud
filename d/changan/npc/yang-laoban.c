//yang-laoban.c
#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
        set_name("杨老板", ({ "yang laoban", "yang","laoban" }));
        set("title", "望星楼老板");
        set("nickname", HIC "消息灵通" NOR);
        set("shen_type", 1);
        set("str", 24);
        set("gender", "男性");
        set("age", 55);
        set("long", "杨老板不但是这儿的掌柜，还是这儿的大厨，\n并且烧得一手好菜。\n");
        set("combat_exp", 50000);
        set("attitude", "friendly");
        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set("vendor_goods", ({
                __DIR__"obj/zuixunfeng",
                __DIR__"obj/snxiangji",
                __DIR__"obj/lhjiyu",
        }));

       setup();
       carry_object(__DIR__"obj/choupao")->wear();
       add_money("coin",  10);
}

void init()
{
       add_action("do_buy", "buy");
       add_action("do_list", "list");
}
