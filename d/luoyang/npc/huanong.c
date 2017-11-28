#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("花农", ({ "hua nong", "hua", "nong" }));
        set("title", HIY "洛阳苗铺" NOR); 
        set("gender", "男性");
        set("long", "一个衣着朴素的老农，他在洛阳苗铺栽花\n"
                    "种草数十年，如果你也想在此种花，可以\n"
                    "向他买一些种子。\n");
        set("str", 100);
        set_skill("unarmed", 50);
        set_skill("dodge", 50);
        set_temp("apply/damage", 15);
        set("combat_exp", 800000);
        set("attitude", "friendly");

        set("vendor_goods", ([
                __DIR__"obj/huazhong": 1,
        ]));

        setup();

        carry_object("/clone/misc/cloth")->wear();
        set_max_encumbrance(100000000);
}

void init()
{
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
