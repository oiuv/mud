inherit NPC;
#include <ansi.h>

void create()
{
        set_name("弟子", ({ "di zi", "di", "zi" }) );
        set("gender", "男性");
        set("age", 23);
        set("attitude", "peaceful");
        set("per", 14);
        set("str", 14);
        set("con", 14);
        set("dex", 14);
        set("int", 14);

        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 30);
        set("max_qi",600);
        set("max_jing",300);
        set("combat_exp", 100000);
        set("shen_type", 0);

        set_skill("sword", 40);
        set_skill("force", 40);
        set_skill("parry", 40);
        set_skill("dodge", 40);
        set_skill("strike", 40);
        set_skill("jueqing-jian", 40);
        set_skill("jueqing-shenfa", 40);
        set_skill("jueqing-xinfa", 40);

        map_skill("sword", "jueqing-jian");
        map_skill("parry", "jueqing-jian");
        map_skill("dodge", "jueqing-shenfa");
        map_skill("force", "jueqing-xinfa");

        create_family("绝情谷", 5, "男弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}
