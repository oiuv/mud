inherit NPC;
#include <ansi.h>
inherit F_MASTER;
void create()
{
        set_name("神照上人", ({ "shen zhao","shen","zhao",}));
        set("long","他是一位秃顶老僧，身穿一袭红色镶边袈裟。\n"
                "他身材略高，太阳穴微凸，双目炯炯有神。\n"
        );
        set("gender", "男性");
        set("title", "康亲王府侍卫头领");
        set("attitude", "friendly");
        set("class", "bonze");
        set("age", 50);
        set("shen_type", 0);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 900);
        set("max_jing", 500);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 50);
        set("combat_exp", 80000);
        set("score", 100);

        set_skill("force", 80);
        set_skill("hunyuan-yiqi", 80);
        set_skill("dodge", 80);
        set_skill("shaolin-shenfa", 80);
        set_skill("cuff", 80);
        set_skill("jingang-quan", 80);
        set_skill("unarmed", 80);
        set_skill("parry", 80);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("cuff", "jingang-quan");
        prepare_skill("cuff", "jingang-quan");
        setup();
        carry_object("/d/beijing/npc/obj/jiasha")->wear();
}
