#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("李阿婆", ({ "li apo", "li", "apo" }));
        set("str", 18);
        set("gender", "女性");
        set("age", 58);
        set("long", "李阿婆在扬州活了几十年，就靠走街串巷卖净菜过日子。\n");
        set("combat_exp", 250);
        set("attitude", "friendly");
        set("vendor_goods", ({
                "/clone/misc/cailiao",
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();

        if (! clonep(this_object()))
        {
                move("/d/city/guangchang");
                message_vision(CYN "\n$N" CYN "弓着腰走了过来，看了看四"
                               "周，咳嗽了两声。\n" NOR, this_object());
                set("startroom", "/d/city/guangchang");

                set("chat_chance", 40);
                set("chat_msg", ({
                        (: NPC_D->random_move(this_object()) :),
                }));
                keep_heart_beat();
        }
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
