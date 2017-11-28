// mu-ren.c 木人

#include <ansi.h>

inherit FIGHTER;

void create()
{
        set_name("木人", ({ "mu ren", "mu", "wood man", "wood" }) );
        set("gender", "男性" );
        set("age", 30);
        set("long", "一个练功用的比武木人，制作精巧，如同真人一般。\n");
        set("scale", 100);
        set("min_exp", 5000);

        set("str", 25);
        set("con", 25);
        set("dex", 25);
        set("int", 25);

        set("max_qi", 300);
        set("eff_qi", 300);
        set("qi", 300);
        set("max_jing", 100);
        set("jing", 100);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 10);
        set("shen_type", 0);


        set("combat_exp", 50000);

        set_skill("force",   30); 
        set_skill("unarmed", 30);
        set_skill("dodge",   30);
        set_skill("parry",   30);

        setup();
}
