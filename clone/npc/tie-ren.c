// tie-ren.c 铁人

#include <ansi.h>

inherit FIGHTER;

void create()
{
        set_name("铁人", ({ "tie ren", "ren" }) );
        set("gender", "男性" );
        set("age", 30);
        set("long", "一个练功用的比武铁人，是仿制木人制作的，由于是用\n"
		    "精制铁材所制的，所以具有更持久的耐力，但是同时也\n"
		    "具有更强大的攻击力，练起功来也就更残酷。\n");
        set("scale", 200);
        set("min_exp", 50000);

        set("str", 35);
        set("con", 35);
        set("dex", 25);
        set("int", 25);

        set("max_qi", 1200);
        set("eff_qi", 1200);
        set("qi", 1200);
        set("max_jing", 1200);
        set("jing", 1200);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 50);
        set("shen_type", 0);


        set("combat_exp", 500000);
        set_skill("force",   120); 
        set_skill("unarmed", 120);
        set_skill("dodge",   120);
        set_skill("parry",   120);

        set_temp("apply/damage",  10);
        set_temp("apply/armor",   20);
        set_temp("apply/attack",  25);
        set_temp("apply/defense", 25);
        set_temp("apply/str",      5);

        setup();
}
