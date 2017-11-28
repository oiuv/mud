// dibao.c

inherit NPC;

void create()
{
	set_name("地保", ({ "dibao" }) );
	set("gender", "男性" );
	set("age", 43);
	set("long", 
"赵洪是这个村子土生土长的人，年轻的时候到外面去闯荡过一阵。\n"
"在镖局当过趟子手，攒了点钱，回来後娶了房老婆，物农为生。\n"
"村里人因他在外见过世面，又会些武功，就推他做了地保。\n");

        set("str", 25);
        set("dex", 20);
        set("con", 17);
        set("int", 15);
	set("shen_type", 1);

        set_skill("unarmed", 30);
	set_skill("dodge", 20);
        set_temp("apply/attack", 15);
        set_temp("apply/defense", 15);
        set("combat_exp", 2500);

	set("attitude", "peaceful");
	setup();
        add_money("coin", 150);
	carry_object(__DIR__"obj/cloth")->wear();
}

