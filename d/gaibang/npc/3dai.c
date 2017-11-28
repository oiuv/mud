#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "男性");
        set("long", "这是位衣着破烂的丐帮弟子，眉目间透出股英气。\n");
        set("title", "丐帮三袋弟子");
        set("age", 26);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 22);
        set("int", 22);
        set("con", 22);
        set("dex", 22);
        set("max_qi", 900);
        set("max_jing", 600);
        set("neili", 1200);
        set("max_neili", 1200);
        set("jiali", 80);
        set("combat_exp", 80000);

        set_skill("force", 80);
        set_skill("jiaohua-neigong", 80);
        set_skill("dodge", 80);
        set_skill("feiyan-zoubi", 80);
        set_skill("staff", 80);
        set_skill("jiaohua-bangfa", 80);
        set_skill("unarmed", 80);
        set_skill("changquan", 80);
        set_skill("parry", 80);
        set_skill("begging", 120);
        set_skill("checking", 120);
        set_skill("literate", 60);
        set_skill("martial-cognize", 60);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("unarmed", "changquan");
        map_skill("parry", "changquan");

        create_family("丐帮", 20, "弟子");

        set_temp("apply/damage", 40);
        set_temp("apply/unarmed_damage", 40);
        set_temp("apply/armor", 60);

        setup();

        carry_object(__DIR__"obj/staff")->wield();
        carry_object(__DIR__"obj/cloth")->wear();
}
