#include <ansi.h>
inherit NPC;
void create()
{
        set_name("教众", ({ "jiao zhong", "jiao", "zhong" }));
        set("long", "一个天鹰教的教众，手中挥舞着一面大旗。\n");
        set("attitude", "heroism");
        set("title", HIW "天鹰教玄武坛" NOR);

        set("combat_exp", 200000+random(200000));

        set_skill("unarmed", 100+random(20));
        set_skill("club", 100+random(20));
        set_skill("parry", 100+random(20));
        set_skill("dodge", 100+random(20));
        set_skill("force", 100+random(20));

        setup();

        carry_object("/d/tulong/tulong/npc/obj/jiaofu")->wear();
        carry_object("/d/tulong/tulong/npc/obj/flag")->wield();
}

