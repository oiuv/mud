#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("ÖìÕþ", ({ "zhu zheng", "zhu", "zheng" }));
        set("gender", "ÄÐÐÔ");
        set("title", "¿ø¼×µêÀÏ°å");
        set("age", 45);
        set_skill("dodge", 80);
        set_skill("force", 80);
        set_skill("parry", 80);
        set_skill("claw", 80);
        set_skill("hand", 80);
        set_skill("strike", 80);
        set_skill("finger", 80);
        set_skill("cuff", 80);
        set_skill("blade", 80);
        set_skill("club", 80);
        set_skill("staff", 80);
        set_skill("sword", 80);
        set_skill("throwing", 80);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/damage", 20);

        set("combat_exp", 400000);
        set("shen_type", 1);
        setup();
        set("vendor_goods", ({
                "/d/city/npc/obj/toukui",
                "/d/city/npc/obj/cycle",
                "/d/city/npc/obj/shield",
                "/d/city/npc/obj/huwan",
                "/d/city/npc/obj/zhitao",
                "/d/city/npc/obj/huyao",
                "/d/city/npc/obj/tieshou",
                "/d/city/npc/obj/jinsijia",
                "/d/luoyang/npc/obj/armor1",
                "/d/luoyang/npc/obj/head1",
                "/d/luoyang/npc/obj/wanlun1",
                "/d/luoyang/npc/obj/hand",
                "/d/luoyang/npc/obj/finger",
        }));
        //carry_object("/d/luoyang/npc/obj/armor1");
        //carry_object("/d/luoyang/npc/obj/head1");
        //carry_object("/d/luoyang/npc/obj/wanlun1");
}

void init()
{
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
