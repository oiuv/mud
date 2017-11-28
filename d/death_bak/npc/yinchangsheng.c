#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("阴长生", ({ "yin changsheng", "yin", "changsheng" }));
        set("title", HIR "冥府地藏王殿前" NOR);
	set("nickname", HIB "阴王" NOR);
        set("shen_type", 1);

        set("gender", "男性");
        set("age", 475);
        set("long","阴长生本是个落弟秀才，后在丰都山修练成仙，御封「阴王」。\n");

        set_skill("unarmed", 500);
        set_skill("dodge", 500);
        set_skill("force", 500);
        set_skill("parry", 500);
        set_skill("magic", 500);
        set_temp("apply/damage", 2000);
        set_temp("apply/parry", 2000);
        set_temp("apply/dodge", 2000);
        set_temp("apply/attack", 2000);
        set_temp("apply/force", 2000);

        set("combat_exp", 20000000);
        set("attitude", "friendly");
        set("vendor_goods", ({
                "/d/death/obj/armor1",
        }));
        
        setup();
        carry_object(__DIR__"obj/cloth5")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
