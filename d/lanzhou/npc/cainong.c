#include <ansi.h>
inherit NPC;
inherit F_VENDOR;

void create()
{
        set_name("菜贩子", ({ "cai fan", "cai", "fan" }) );
        set("gender", "男性" );
        set("age", 32);
        set("long", "一个老实巴交的农民，卖些新鲜的蔬菜。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "菜贩子叫道：卖新鲜的萝卜吆。\n" NOR,
                CYN "菜贩子叫道：卖新鲜的胡萝卜吆。\n" NOR,
                CYN "菜贩子叫道：卖新鲜的白菜吆。\n" NOR,
                CYN "菜贩子叫道：卖新鲜的大葱吆。\n" NOR,
                CYN "菜贩子叫道：卖新鲜的土豆吆。\n" NOR,
        }) );       

        set("vendor_goods", ({
                "/d/beijing/obj/luobo",
                "/d/beijing/obj/huluobo",
                "/d/beijing/obj/baicai",
                "/d/beijing/obj/dacong",
                "/d/beijing/obj/tudou",
        }) );

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("coin", 80);
}

void init()
{
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
