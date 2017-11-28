#include <ansi.h>
inherit NPC;

void create()
{
        set_name("包拯", ({ "bao zheng", "bao", "zheng" }));
        set("title", HIY "龙图大学士" NOR);
        set("gender", "男性");
        set("age", 53);
        set("str", 20);
        set("dex", 20);
        set("long", "他就是朝中的龙图大学士包丞相。只见他面色黝\n"
                    "黑，相貌清奇，气度不凡。让你不由自主，好生\n"
                    "敬仰\n");
        set("combat_exp", 3000000);
        set("shen_type", 1);
        set("attitude", "heroism");

        set_skill("unarmed", 50);
        set_skill("force", 50);
        set_skill("sword", 50);
        set_skill("dodge", 50);
        set_skill("parry", 50);
        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/armor", 50);
        set_temp("apply/damage", 15);

        set("neili", 500); 
        set("max_neili", 500);
        set("jiali", 10);

        setup();
        carry_object("/d/beijing/npc/obj/goldcloth2")->wear();
}

