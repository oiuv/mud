#include <ansi.h>

inherit KNOWER;
inherit F_VENDOR;

void create()
{
        set_name("小贩", ({ "xiao fan", "xiao", "fan" }));
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性" );
        set("age", 32);
        set("long", "这是个小贩，别看他长的老老实实，可你别\n"
                    "想从他那儿掏便宜。\n");
        set("combat_exp", 300);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "friendly");
        set("vendor_goods", ({
                "/d/xingxiu/obj/fire",
                "/d/quanzhen/npc/obj/stick",
                "/d/quanzhen/npc/obj/bottle",
                "/d/quanzhen/npc/obj/egg",
        }));
        setup();
        carry_object("/clone/cloth/cloth")->wear();
        add_money("coin", 100);
}

void init()
{
        ::init();
        add_action("do_list","list");
        add_action("do_buy", "buy");
}
