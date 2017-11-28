#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("王方平", ({ "wang fangping", "wang", "fangping" }));
        set("title", HIR "冥府地藏王殿前" NOR);
        set("nickname", WHT "鬼王" NOR);
        set("shen_type", 1);

        set("gender", "男性");
        set("age", 475);
        set("long", "王方平本是山中道士，后在丰都山修炼成仙，御封「鬼王」。\n");

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
                "/d/death/obj/weapon1",
                "/d/death/obj/weapon2",
                "/d/death/obj/weapon3",
                "/d/death/obj/weapon4",
                "/d/death/obj/weapon5",
                "/d/death/obj/weapon6",
                "/d/death/obj/weapon7",
                "/d/death/obj/weapon8",
                "/d/death/obj/weapon9",
                "/d/death/obj/weapon10",
                "/d/death/obj/weapon11",
                "/d/death/obj/weapon12",
                "/d/death/obj/weapon13",
                "/d/death/obj/weapon14",
                "/d/death/obj/weapon15",
                "/d/death/obj/weapon16",
                "/d/death/obj/weapon17",
                "/d/death/obj/weapon18",
                "/d/death/obj/weapon19",
                "/d/death/obj/weapon20",
                "/d/death/obj/weapon21",
                "/d/death/obj/weapon22",
                "/d/death/obj/weapon23",
                "/d/death/obj/weapon24",
                "/d/death/obj/weapon25",
                "/d/death/obj/weapon26",
                "/d/death/obj/weapon27",
                "/d/death/obj/weapon28",
                "/d/death/obj/weapon29",
                "/d/death/obj/weapon30",
                "/d/death/obj/weapon31",
                "/d/death/obj/weapon32",
                "/d/death/obj/weapon33",
                "/d/death/obj/weapon34",
                "/d/death/obj/weapon35",
                "/d/death/obj/weapon36",
                "/d/death/obj/weapon37",
                "/d/death/obj/weapon38",
                "/d/death/obj/weapon39",
                "/d/death/obj/weapon40",
                "/d/death/obj/weapon41",
                "/d/death/obj/weapon42",
                "/d/death/obj/weapon43",
                "/d/death/obj/weapon44",
                "/d/death/obj/weapon45",
                "/d/death/obj/weapon46",
                "/d/death/obj/weapon47",
                "/d/death/obj/weapon48",
                "/d/death/obj/weapon49",
                "/d/death/obj/weapon50",
                "/d/death/obj/weapon51",
                "/d/death/obj/weapon52",
                "/d/death/obj/weapon53",
                "/d/death/obj/weapon54",
                "/d/death/obj/weapon55",
                "/d/death/obj/weapon56",
                "/d/death/obj/weapon57",
                "/d/death/obj/weapon58",
                "/d/death/obj/weapon59",
                "/d/death/obj/weapon60",
                "/d/death/obj/weapon61",
                "/d/death/obj/weapon62",
                "/d/death/obj/weapon63",
                "/d/death/obj/weapon64",
                "/d/death/obj/weapon65",
                "/d/death/obj/weapon66",
                "/d/death/obj/weapon67",
                "/d/death/obj/weapon68",
                "/d/death/obj/weapon69",
                "/d/death/obj/weapon70",
                "/d/death/obj/weapon71",
                "/d/death/obj/weapon72",
                "/d/death/obj/weapon73",
                "/d/death/obj/weapon74",
                "/d/death/obj/weapon75",
                "/d/death/obj/weapon76",
                "/d/death/obj/weapon77",
                "/d/death/obj/weapon78",
                "/d/death/obj/weapon79",
                "/d/death/obj/weapon80",
        }));
        
        setup();
        carry_object(__DIR__"obj/cloth4")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

