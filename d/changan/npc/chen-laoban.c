//chen-laoban
#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
        set_name("陈老板", ({ "chen laoban", "chen","laoban" }));
        set("title", "首饰店老板");
        set("nickname", HIC "消息灵通" NOR);
        set("shop_id", ({"laoban"}));
        set("gender", "男性");
        set("shen_type", 1);
        set("age", 43);
        set("combat_exp", 100000);
        set("attitude", "friendly");
        set("str", 30);
        set("max_qi", 300);
        set("max_jing", 300);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", random(10)+15);
        set_skill("unarmed", 30);
        set_skill("parry", 40);
        set_skill("dodge", 40);
        set("vendor_goods", ({
        	__DIR__"obj/yinjie",
        	__DIR__"obj/zuanjie",
        	__DIR__"obj/baojie",
        	__DIR__"obj/jinjie",
        	__DIR__"obj/baijie",
        }));

        setup();
        carry_object(__DIR__"obj/choupao")->wear();
}

void init()
{
        ::init();
        add_action("do_buy", "buy");
	add_action("do_list", "list");
}
