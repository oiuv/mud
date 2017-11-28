#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "ÄÐÐÔ");
        set("long", "ÕâÊÇÎ»Ø¤°ïÒ»´üµÜ×Ó£¬Éí×ÅÆÆÆÆÀÃÀÃ£¬ÂúÉíÓÍÄå¡£\n");
        set("title", "Ø¤°ïÒ»´üµÜ×Ó");
        set("age", 18);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 30);
        set("combat_exp", 25000);

        set_skill("force", 50);
        set_skill("jiaohua-neigong", 50);
        set_skill("dodge", 50);
        set_skill("feiyan-zoubi", 50);
        set_skill("staff", 50);
        set_skill("jiaohua-bangfa", 50);
        set_skill("unarmed", 50);
        set_skill("changquan", 50);
        set_skill("parry", 50);
        set_skill("begging", 80);
        set_skill("checking", 80);
        set_skill("literate", 30);
        set_skill("martial-cognize", 30);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("unarmed", "changquan");
        map_skill("parry", "changquan");

        create_family("Ø¤°ï", 20, "µÜ×Ó");

        set_temp("apply/damage", 10);
        set_temp("apply/unarmed_damage", 10);
        set_temp("apply/armor", 30);

        setup();

        if (random(3) > 1)
                carry_object(__DIR__"obj/staff")->wield();

        carry_object(__DIR__"obj/cloth")->wear();
}
