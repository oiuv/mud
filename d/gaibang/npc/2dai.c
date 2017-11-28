#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "ÄÐÐÔ");
        set("long", "ÕâÊÇÎ»Ø¤°ï¶þ´üµÜ×Ó£¬Éí×ÅÆÆÆÆÀÃÀÃ£¬ÂúÉíÓÍÄå¡£\n");
        set("title", "Ø¤°ï¶þ´üµÜ×Ó");
        set("age", 22);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 650);
        set("max_jing", 400);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 40);
        set("combat_exp", 50000);

        set_skill("force", 80);
        set_skill("jiaohua-neigong", 80);
        set_skill("dodge", 60);
        set_skill("feiyan-zoubi", 60);
        set_skill("staff", 60);
        set_skill("jiaohua-bangfa", 60);
        set_skill("unarmed", 60);
        set_skill("changquan", 60);
        set_skill("parry", 60);
        set_skill("begging", 100);
        set_skill("checking", 100);
        set_skill("literate", 50);
        set_skill("martial-cognize", 50);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("unarmed", "changquan");
        map_skill("parry", "changquan");

        create_family("Ø¤°ï", 20, "µÜ×Ó");

        set_temp("apply/damage", 25);
        set_temp("apply/unarmed_damage", 25);
        set_temp("apply/armor", 50);

        setup();

        carry_object(__DIR__"obj/staff")->wield();
        carry_object(__DIR__"obj/cloth")->wear();
}
