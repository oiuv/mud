#include <ansi.h>
inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("刘素素", ({ "liu susu", "liu", "susu" }));
        set("long", "她是一个清秀素雅的苏州女子，后来转到扬州来做生意。\n");
        set("gender", "女性");
        set("age", 18);
        set("per", 28);
        set("title", "西花扇庄老板");
        set("nickname", HIC "轻罗小扇" NOR);
        set("attitude", "friendly");

        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "刘素素道：中华扇文化历史悠久，扇品扇样更"
                "是繁多，应该好好光大。\n" NOR
        }));

        set("vendor_goods", ({
                __DIR__"shanzi/shan-book",
                __DIR__"shanzi/yumao-shan",
                __DIR__"shanzi/tuan-shan",
                __DIR__"shanzi/zhe-shan",
                __DIR__"shanzi/yuban-shan",
                __DIR__"shanzi/chouwu-shan",
                __DIR__"shanzi/bajiao-shan",
                __DIR__"shanzi/tanxiang-shan",
        }));

        setup();
        carry_object("/d/city/npc/cloth/gui-dress")->wear();
        set_temp("handing", carry_object("/d/city/npc/shanzi/tuan-shan"));
        add_money("silver", 2);
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
